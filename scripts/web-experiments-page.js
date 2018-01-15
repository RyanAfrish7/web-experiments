const navElem = document.body.querySelector("header > a");
navElem.setAttribute("faded", true);
navElem.animate([
    {opacity: 0},
    {opacity: 1}
], {
    duration: 200,
    delay: 1000,
    easing: "cubic-bezier(0.39, 0.575, 0.565, 1)"
}).onfinish = () => {
    navElem.removeAttribute("faded");
};

let sectionCount = 0;
document.body.querySelectorAll(".space > section").forEach(section => {
    section.setAttribute("faded", true);
    section.animate([
        {opacity: 0, transform: "translateY(200px)"},
        {opacity: 1, transform: "translateY(0)"}
    ], {
        duration: 400,
        delay: sectionCount * 200,
        easing: "cubic-bezier(0.39, 0.575, 0.565, 1)"
    }).onfinish = () => {
        section.removeAttribute("faded");
    };
    sectionCount++;
});