const TypeOfRoom = Object.freeze({
    FOYER: "FOYER",
    FOODCOURT: "FOODCOURT",
    RECEPTION: "RECEPTION"
});

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = TypeOfRoom;
}