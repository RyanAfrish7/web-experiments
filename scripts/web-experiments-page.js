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

const sectionObserver = new IntersectionObserver(entries => {
    let count = 0;
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            count++;
            entry.target.animate([
                {opacity: 0, transform: "translateY(200px)"},
                {opacity: 1, transform: "translateY(0)"}
            ], {
                duration: 400,
                delay: count * 200,
                easing: "cubic-bezier(0.39, 0.575, 0.565, 1)"
            }).onfinish = () => {
                entry.target.removeAttribute("faded");
            };
            sectionObserver.unobserve(entry.target);
        }
    });
});

document.body.querySelectorAll(".space > section").forEach(section => {
    section.setAttribute("faded", true);
    sectionObserver.observe(section);
});