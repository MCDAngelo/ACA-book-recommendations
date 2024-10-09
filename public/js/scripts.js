var addBookButtons = $("button.add-book")

for (var i = 0; i < addBookButtons.length; i++) {
    addBookButtons[i].addEventListener("click", handleClick);
}

function handleClick() {
    var formName = this.id + "Form";
    console.log(formName);
    buttonAnimation(formName);
}

function buttonAnimation(choice) {
    var formChoice = $("#" + choice);
    console.log(formChoice);
    var bool=formChoice.is(":hidden")
    formChoice.toggleClass('hidden')
    formChoice.attr('hidden',!bool)
}