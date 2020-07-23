const fileUpload = require('express-fileupload');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const AccountService = require('../services/AccountService');
const SlotService = require('../services/SlotService')
const path = require('path');
const FileSystem = require('../../config/FileSystem')

module.exports = class RouteController {

    #app;
    #io;

    constructor(app, io) {
        this.#app = app;
        this.#io = io;
    }

    init() {

        var username, title, forename, surname, job, company, email;

        //sets the view engine to ejs, ejs is required to render templates
        this.#app.set('view engine', 'ejs');

        //sets the views directory for rendering the ejs templates
        this.#app.set('views',path.join(__dirname, '../views/'));

        this.#app.use(bodyParser.urlencoded({extended : true}));
        this.#app.use(bodyParser.json());
        this.#app.use(fileUpload());

        var sessionMiddleware = expressSession({
            secret: 'secret',
            resave: true,
            saveUninitialized: true
        });

         //Allows to access the session from the server side
        this.#io.use(function(socket, next) {
            sessionMiddleware(socket.request, socket.request.res || {}, next)
        });

        this.#app.use(sessionMiddleware);
        
        /* On receiving a get-Request, the express-Server will deliver the
        * index.html file to the user.
        * - (E) */
        this.#app.get('/', (request, response) => {
            if (request.session.loggedin === true) {
                username = request.session.username;
                email = request.session.email;
                title = request.session.title;
                forename = request.session.forename;
                surname = request.session.surname;
                response.render('index', {loggedIn: true, username: username, email: email, title: title, forename: forename, surname: surname});
            } else {
            response.render('index');
            }
        });

        this.#app.get('/upload', (request, response) => {
            if (request.session.loggedin === true) {
                response.render('upload', {loggedIn: true, username: username, email: email, title: title, forename: forename, surname: surname});
            } else {
                response.redirect('/');
            }
        });

        this.#app.post('/upload', (request, response) => {
            if (!request.files || Object.keys(request.files).length === 0) {
                return response.send('No files were uploaded. <a href="/upload">Back to page</a>');
            }

            var maxParticipants = parseInt(request.body.maxParticipants);
            if (maxParticipants % 1 !== 0 || !(isFinite(maxParticipants))) {
                return response.send('Max participants must be integer. <a href="/upload">Try again</a>')
            }

            var startingTime = new Date(request.body.startingTime);
            if (startingTime == "Invalid Date") {
                return response.send('Starting time must be a valid date. <a href="/upload">Try again</a>')
            }
            
            var title = request.body.title;
            var remarks = request.body.remarks;
            var oratorId = request.session.accountId;

            var video = request.files.video
            console.log(video)
            var videoName = video.name;
            var videoSize = video.size;

            if(videoName.includes(".mp4")) {
                if(videoSize > 524288000)
                    return response.send('File size exceeded 500 MB. <a href="/upload">Back to page</a>')
                else {
                    return SlotService.storeVideo(video).then(videoId => {
                        return SlotService.createSlot(videoId, "1", title, remarks, startingTime, oratorId, maxParticipants).then(res => {
                            response.redirect('/');
                            response.end();
                        }).catch(err => {
                            console.error(err);
                        })
                    }).catch(err => {
                        console.error(err);
                    })
                }
            } else {
                response.send('File type is not supported. <a href="/upload">Back to page</a>');
            }
        });

        this.#app.get('/login', (request, response) => {
            if (request.session.loggedin === true) {
                response.redirect('/');
            } else {
                response.render('login');
            }
            
        });

        this.#app.get('/game', (request, response) => {
            if (request.session.loggedin === true) {
                response.sendFile(path.join(__dirname + '../../../game/app/client/views/canvas.html'));
            } else {
                response.redirect('/');
            }
        })

        this.#app.get('/game/video/:videoName', (request,response) => {
            if (request.session.loggedin === true) {
                var rs = FileSystem.createReadStream(path.join(__dirname + '../../../config/download/' + request.params.videoName));
                rs.pipe(response);
            } else {
                response.redirect('/');
            }
        })

        this.#app.post('/login', (request, response) => {
            username = request.body.username;
            var password = request.body.password;

            return AccountService.verifyLoginData(username, password).then(user => {
                
                if(user) {
                    request.session.loggedin = true;
                    request.session.accountId = user.getAccountID();
                    console.log(username)
                    request.session.username = username;
                    console.log(request.session.username);
                    request.session.title = user.getTitle();
                    request.session.surname = user.getSurname();
                    request.session.forename = user.getForename();
                    request.session.job = user.getJob();
                    request.session.company = user.getCompany();
                    request.session.email = user.getEmail();
                    response.redirect('/');
                }
                else {
                    response.render('login', {wrongLoginData: true});
                }
                response.end();
            }).catch(err => {
                console.error(err);
            })
        });

        this.#app.get('/register', (request, response) => {
            if (request.session.registerValid === true) {
                username = request.session.username;
                email = request.session.email;
                response.render('register', {registerValid: true, username: username, email: email});
            }
            else if (request.session.loggedin === true) {
                response.redirect('/');
            }
            else {
                response.render('register', {registerValid: false});
            }
        });

        this.#app.post('/register', (request, response) => {

            if (request.body.username.length > 10) {
                return response.send('Max. username length is 10 characters. <a href="/register">Try again</a>');
            }

            username = request.body.username;
            email = request.body.email;

            const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailRegex.test(String(email).toLowerCase())) {

            } else {
                return response.send('Invalid Email Address. <a href="/register">Try again</a>')
            }

            return AccountService.isUsernameValid(username).then(res => {
                if(res) {
                    return AccountService.isEmailValid(email).then(res => {
                        if(res) {
                            request.session.registerValid = true;
                            request.session.username = username;
                            request.session.email = email;
                            response.redirect('/register');
                        }
                        else {
                            response.send('Email is already registered. <a href="/register">Try again</a>');
                        }
                        response.end();
                    }).catch(err => {
                        console.error(err);
                    })
                }
                else {
                    response.send('Username is already taken. <a href="/register">Try again</a>');
                }
                response.end();
            }).catch(err => {
                console.error(err);
            })
        });

        this.#app.post('/registerValid', (request, response) => {
            username = request.session.username;
            title = request.body.title;

            if(title === "Title") {
                title = "";
            }
            else if(title !== "Mr." && title !== "Mrs." && title !== "Ms." && title !== "Dr." && title !== "Rev." && title !== "Miss" && title !== "Prof."){
                return response.send('Invalid title. <a href="/register">Try again</a>')
            }

            surname = request.body.surname;
            forename = request.body.forename;
            job = request.body.job;
            company = request.body.company;
            email = request.session.email;
            var password = request.body.password;

            return AccountService.createAccount(username, title, surname, forename, job, company, email, password).then(res => {
                request.session.accountId = res.getAccountID();
                request.session.registerValid = false;
                request.session.loggedin = true;
                request.session.title = res.getTitle();
                request.session.surname = res.getSurname();
                request.session.forename = res.getForename();

                //Needed for creating business card during entering the conference.
                request.session.username = res.getUsername();
                request.session.job = res.getJob();
                request.session.company = res.getCompany();
                request.session.email = res.getEmail();
                response.redirect('/');
                response.end();
            }).catch(err => {
                response.send('Registration failed. <a href="/register">Try again</a>');
                console.error(err);
            })
        })

        this.#app.post('/editRegistration', (request, response) => {
            request.session.registerValid = false;
            response.redirect('/register');
            response.end();
        })

        this.#app.get('/logout', (request, response) => {
            request.session.destroy();
            response.redirect('/');
        });

        this.#app.get('/account', (request, response) => {
            if (request.session.loggedin = true) {
            username = request.session.username;
            email = request.session.email;
            title = request.session.title;
            forename = request.session.forename;
            surname = request.session.surname;
            job = request.session.job;
            company = request.session.company;
            response.render('account', {loggedIn: true, username: username, email: email, title: title, forename: forename, surname: surname, job: job, company: company});
            }

            else {
                response.render('/');
            }
        })
    }

}