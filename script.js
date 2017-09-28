$newContact = $('#new_contact');
$noContacts = $('#no_contacts');
$tools = $('#tools');
$submitBTN = $('#submit');
$contacts = $('#contacts');

$fullName = $('#full_name');
$email = $('#email');
$phone = $('#phone');
$occupation = $('#occupation');

var contactManager = {
  registerHandlers: function() {
    $('.add_contact').on('click', this.handleAddContact.bind(this));
    $('#cancel').on('click', this.handleCancel.bind(this));
    $submitBTN.on('click', this.handleSubmit.bind(this));
    $(document).on('click', '.delete', this.handleDeleteContact.bind(this));
  },
  handleDeleteContact: function(e) {
    var $contact = $(e.target.closest('.contact'));
    var id = +$contact.attr('data-id');
    this.contacts = this.contacts.filter(obj => obj['id'] !== id);
    $contact.remove();
  },
  handleAddContact: function() {
    $noContacts.slideUp();
    $tools.slideUp();
    $contacts.slideUp();
    $newContact.slideDown();
  },
  handleCancel: function() {
    $newContact.slideUp();
    $contacts.slideDown();
    $tools.slideDown();
    if (this.contacts.length === 0) $noContacts.slideDown();
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var occupation = $('input[name="occupation"]:checked').val();
    var contact = {
      name: $fullName.val(),
      email: $email.val(),
      phone: $phone.val(),
      occupation: occupation,
      id: this.contactID,
    };
    this.insertContact(contact);
    this.contacts.push(contact);
    this.handleCancel();
  },
  insertContact: function(contact) {
    var source = $('#entry-template').html();
    var template = Handlebars.compile(source);
    $('#contacts').append(template(contact)).children('.contact:last-child').attr('data-id', this.contactID++);
  },
  init: function() {
    this.registerHandlers();
    this.contacts = [];
    this.contactID = 1;
  }
}
var test = Object.create(contactManager);
test.init();
