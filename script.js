$newContact = $('#new_contact');
$noContacts = $('#no_contacts');
$tools = $('#tools');
$submitBTN = $('#submit');
$contacts = $('#contacts');

/* INPUTS */
$fullName = $('#full_name');
$email = $('#email');
$phone = $('#phone');
$occupation = $('#occupation');

/* ELEMENTS */
$invalidNotification = $('<p>please enter valid value</p>');
$invalidOccupation = $('<p>You must select an occupation</p>');

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
    this.handleCancel();
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
      if (this.validInput(contact)) {
        this.insertContact(contact);
        this.contacts.push(contact);
        this.handleCancel();
        this.clearForm();
      }
  },
  clearForm: function() {
    $('button[type=reset]').trigger('click');
  },
  validInput: function(contact) {
    if (!contact.name.match(/^\w+( \w*)*$/)) {
      this.invalid($fullName);
      return false;
    } else {
      this.valid($fullName);
    }
    if (!contact.email.match(/^[a-zA-Z1-9._]+@\w+\.[a-z]{2,4}$/)) {
      this.invalid($email);
      return false;
    } else {
      this.valid($email);
    }
    if (!contact.phone.match(/^(\d{3}[\.-]?){2}\d{4}$/)) {
      this.invalid($phone);
      return false;
    } else {
      this.valid($phone);
    }
    if (contact.occupation === undefined) {
      this.invalidOccupation();
      return false;
    } 

    return true;
  },
  invalid: function(input) {
    input.closest('div').addClass('invalid').append($invalidNotification);
  },
  valid: function(input) {
    input.closest('div').removeClass('invalid');
  },
  invalidOccupation: function() {
    $occupation.append($invalidOccupation);
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
