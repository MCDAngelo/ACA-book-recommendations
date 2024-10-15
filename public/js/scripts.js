var addBookButtons = $("button.add-book")

for (var i = 0; i < addBookButtons.length; i++) {
    addBookButtons[i].addEventListener("click", handleAddBookClick);
}

function handleAddBookClick() {
    var formName = this.id + "Form";
    console.log(formName);
    addBookButtonAnimation(formName);
}

function addBookButtonAnimation(choice) {
    var formChoice = $("#" + choice);
    console.log(formChoice);
    var bool=formChoice.is(":hidden")
    formChoice.toggleClass('hidden')
    formChoice.attr('hidden',!bool)
}

var cards = $('.book-card');

[...cards].forEach((card)=>{
  card.addEventListener( 'click', function() {
    card.classList.toggle('is-flipped');
  });
});