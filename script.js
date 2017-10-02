$newContact = $('#new_contact');
$noContacts = $('#no_contacts');
$tools = $('#tools');
$submitBTN = $('#submit');
$contacts = $('#contacts');

/* SEARCH */
$search = $('#search input[type=text]');
$searchTags = $('input[name=search-tag]');
$searchNoContacts = $('#search_no_contacts');

/* INPUTS */
$fullName = $('#full_name');
$email = $('#email');
$phone = $('#phone');
$occupation = $('#occupation');

var contactManager = {
  saveContactData: function() {
    localStorage.setItem('contacts', JSON.stringify(this.contacts));
    localStorage.setItem('serialID', this.serialID);
  },
  loadContactsData: function() {
    this.contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    this.serialID = +localStorage.getItem('serialID') || 1;
    if (this.contacts.length !== 0) $noContacts.hide();
  },
  registerHandlers: function() {
    $('.add_contact').on('click', this.handleAddContact.bind(this));
    $('#cancel').on('click', this.handleCancel.bind(this));
    $submitBTN.on('click', this.handleSubmit.bind(this));
    $(document).on('click', '.delete', this.handleDeleteContact.bind(this));
    $(document).on('click', '.edit', this.handleUpdate.bind(this));
    $(document).on('click keyup', '#search', this.handleSearch.bind(this));
  },
  handleSearch: function(e) {
    this.clearAllContacts();
    var activeTags = this.retrieveTags(e);
    var query = $search.val().toLowerCase();
    this.contacts.forEach(function(contact) {
      var occupation = contact['occupation'];
      var name = contact['name'].toLowerCase();
      if (activeTags.includes(occupation) && name.slice(0, query.length) === query) {
        this.insertNewContact(contact);
      }   
    }.bind(this));

    if ($contacts.children('.contact').length === 0 && this.contacts.length !== 0) {
      $searchNoContacts.slideDown().contents($('em').html($search.val()));
    }
    else {
      $searchNoContacts.slideUp();
    }
  },
  retrieveTags: function(e) {
    var activeTags = [];
      $searchTags.each(function(i) {
        if ($searchTags[i].checked) activeTags.push($searchTags[i].getAttribute('data-tag'))
      });
    return activeTags;
  },
  handleDeleteContact: function(e) {
    var $contact = $(e.target.closest('.contact'));
    var id = +$contact.attr('data-id');
    this.contacts = this.contacts.filter(obj => obj['id'] !== id);
    $contact.remove();
    this.handleCancel();
    this.saveContactData();
  },
  handleAddContact: function() {
    if ($submitBTN[0].hasAttribute('data-updating')) {
      $submitBTN.removeAttr('data-updating');
      $('#new_contact > h2').html('Create Contact');
      this.clearForm();
    }
    this.setAllValid();
    this.openForm();
  },
  openForm: function() {
    $noContacts.slideUp();
    $tools.slideUp();
    $contacts.slideUp();
    $newContact.slideDown();
  },
  handleCancel: function() {
    $newContact.slideUp();
    $contacts.slideDown();
    $tools.slideDown();

    this.loadAllContacts();
    this.resetSearch();
    if (this.contacts.length === 0) $noContacts.slideDown();
  },
  resetSearch: function() {
    $search.val('');
    $searchTags.prop('checked', true);
  },
  handleUpdate: function(e) {
    var id = $(e.target).closest('.contact').attr('data-id');
    var contact = this.contacts.find(contact => contact['id'] === +id);
    this.openForm();
    $fullName.val(contact['name']);
    $email.val(contact['email']);
    $phone.val(contact['phone']);
    $('#' + contact['occupation']).prop('checked', true);
    this.validInput(contact);
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
        id: this.serialID,
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
          this.serialID++;
      }
        this.handleCancel();
        this.clearForm();
        this.saveContactData();
      }
  },
  loadAllContacts: function() {
    this.clearAllContacts();
    this.contacts.forEach(contact => this.insertNewContact(contact));
    if (this.contacts.length === 0) $noContacts.slideDown();
  },
  clearAllContacts: function() {
    $('.contact').remove();
  },
  clearForm: function() {
    $('button[type=reset]').trigger('click');
  },
  validInput: function(contact) {
    valid = true;
    if (!this.validateInput($fullName, contact.name, /^\w+( \w*)*$/)) valid = false;
    if (!this.validateInput($email, contact.email, /^[a-zA-Z1-9._]+@\w+\.[a-z]{2,4}$/)) valid = false;
    if (!this.validateInput($phone, contact.phone, /^(\d{3}[\.-]?){2}\d{4}$/)) valid = false;
    if (!this.validateInput($occupation, contact.occupation, '')) valid = false;

    return valid;
  },
  validateInput: function(element, string, regex) {
    if (string === undefined || !string.match(regex)) {
      this.setInvalid(element);
      return false;
    } else {
      this.setValid(element);
      return true
    }
  },
  setInvalid: function(input) {
    input.closest('div.input').addClass('invalid');
  },
  setValid: function(input) {
    input.closest('div.input').removeClass('invalid');
  },
  setAllValid: function() {
    $('div.input').removeClass('invalid');
  },
  insertNewContact: function(contact) {
    var source = $('#entry-template').html();
    var template = Handlebars.compile(source);
    $contacts.append(template(contact)).children('.contact:last-child').attr('data-id', contact['id']);
  },
  init: function() {
    this.registerHandlers();
    this.loadContactsData();
    this.loadAllContacts();
  }
}
var test = Object.create(contactManager);
test.init();
