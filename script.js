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

var contactManager = {
  registerHandlers: function() {
    $('.add_contact').on('click', this.handleAddContact.bind(this));
    $('#cancel').on('click', this.handleCancel.bind(this));
    $submitBTN.on('click', this.handleSubmit.bind(this));
    $(document).on('click', '.delete', this.handleDeleteContact.bind(this));
    $(document).on('click', '.edit', this.handleUpdate.bind(this));
  },
  handleDeleteContact: function(e) {
    var $contact = $(e.target.closest('.contact'));
    var id = +$contact.attr('data-id');
    this.contacts = this.contacts.filter(obj => obj['id'] !== id);
    $contact.remove();
    this.handleCancel();
  },
  handleAddContact: function() {
    if ($submitBTN[0].hasAttribute('data-updating')) {
      $submitBTN.removeAttr('data-updating');
      $('#new_contact > h2').html('Create Contact');
      this.clearForm();
    }
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
  handleUpdate: function(e) {
    var id = $(e.target).closest('.contact').attr('data-id');
    var contact = this.contacts.find(contact => contact['id'] === +id);
    this.handleAddContact();
    $fullName.val(contact['name']);
    $email.val(contact['email']);
    $phone.val(contact['phone']);
    $('#' + contact['occupation']).prop('checked', true);
    $('#new_contact h2').text('Edit Contact');
    $submitBTN.attr('data-updating', id);
  },
  handleSubmit: function(e) {
      e.preventDefault();
      var updateID = +$submitBTN.attr('data-updating') || null;
      var occupation = $('input[name="occupation"]:checked').val();
      var contact = {
        name: $fullName.val(),
        email: $email.val(),
        phone: $phone.val(),
        occupation: occupation,
        id: this.contactID,
      };
      if (this.validInput(contact)) {
        if (updateID) {
          contact['id'] = updateID;
          var contactIDX = this.contacts.findIndex(contact => contact['id'] === updateID);
          this.contacts.splice(contactIDX, 1, contact);
          this.loadAllContacts();
        } else {
          this.insertNewContact(contact);
          this.contacts.push(contact);
          this.contactID++;
      }
        this.handleCancel();
        this.clearForm();
      }
  },
  loadAllContacts: function() {
    this.clearAllContacts();
    this.contacts.forEach(contact => this.insertNewContact(contact));
  },
  clearAllContacts: function() {
    $('.contact').remove();
  },
  clearForm: function() {
    $('button[type=reset]').trigger('click');
  },
  validInput: function(contact) {
    var valid = true;
    if (!contact.name.match(/^\w+( \w*)*$/)) {
      this.invalid($fullName);
      valid = false;
    } else {
      this.valid($fullName);
    }
    if (!contact.email.match(/^[a-zA-Z1-9._]+@\w+\.[a-z]{2,4}$/)) {
      this.invalid($email);
      valid = false;
    } else {
      this.valid($email);
    }
    if (!contact.phone.match(/^(\d{3}[\.-]?){2}\d{4}$/)) {
      this.invalid($phone);
      valid = false;
    } else {
      this.valid($phone);
    }
    if (contact.occupation === undefined) {
      this.invalid($occupation);
      valid = false;
    } else {
      this.valid($occupation);
    }

    return valid;
  },
  invalid: function(input) {
    var $div = input.closest('div');
    if (!$div.hasClass('invalid')) $div.addClass('invalid');
  },
  valid: function(input) {
    input.closest('div').removeClass('invalid');
  },
  insertNewContact: function(contact) {
    var source = $('#entry-template').html();
    var template = Handlebars.compile(source);
    $('#contacts').append(template(contact)).children('.contact:last-child').attr('data-id', this.contactID);
  },
  init: function() {
    this.registerHandlers();
    this.contacts = [];
    this.contactID = 1;
  }
}
var test = Object.create(contactManager);
test.init();
