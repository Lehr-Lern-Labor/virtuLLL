class ProfileView extends WindowView {
    #businessCard;
    #isModerator;

    /**
     * @constructor Creates an instance of ProfileView
     */
    constructor() {
        super();

        if (!!ProfileView.instance) {
            return ProfileView.instance;
        }

        ProfileView.instance = this;

        $('#profileModal').on('hidden.bs.modal', function (e) {
            $('#profileModal .modal-header').empty()
            $('#profileModal .modal-body').empty()
        })
    }

    /**
     * Draws profile window
     * 
     * @param {BusinessCardClient} businessCard own business card
     * @param {boolean} isModerator true if moderator, otherwise false
     */
    draw(businessCard, isModerator) {
        this.#businessCard = businessCard;
        this.#isModerator = isModerator;

        $('#profileModal .modal-header').append(`
            <h5 class="modal-title d-inline-block" id="profileModalTitle">
            <i class="fa fa-user-circle pr-2 navbarIcons" style="transform: scale(1)"></i>
            ${this.#businessCard.getTitle() + " " + this.#businessCard.getForename() + " " + this.#businessCard.getSurname() + " (@" + this.#businessCard.getUsername() + ")"}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
            </button>
        `)

        $('#profileModal .modal-body').append(`
            <table id="profile" style = "color: antiquewhite; width:100%; margin-left: 0">
                <tr>
                    <td style="border-right: 1pt solid antiquewhite; text-align: right; padding: 15px" >Profession</td>
                    <td style="padding: 15px">${this.#businessCard.getJob() + " at " + this.#businessCard.getCompany()}</td>
                </tr>
                <tr>
                    <td style="border-right: 1pt solid antiquewhite ; text-align: right; padding: 15px">Email</td>
                    <td style="padding: 15px">${this.#businessCard.getEmail()}</td>
                </tr>
        `)

        if(this.#isModerator) {
            $('#profileModal .modal-body #profile').append(`
                <tr>
                    <td style="border-right: 1pt solid antiquewhite ; text-align: right; padding: 15px">Role</td>
                    <td style="padding: 15px">Moderator</td>
                </tr>
            `)
        } else {
            $('#profileModal .modal-body #profile').append(`
                <tr>
                    <td style="border-right: 1pt solid antiquewhite ; text-align: right; padding: 15px">Role</td>
                    <td style="padding: 15px">Participant</td>
                </tr>
            `)
        }

        $('#profileModal .modal-body').append(`
            </table>
        `)

        $('#profileModal').modal('show');
    }
}