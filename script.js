var Contact = {
  init: function(name, email, phone, occupation) {
    if (typeof name === "object") {
      occupation = name.occupation;
      phone = name.phone;
      email = name.email;
      name = name.name;
    }
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.occupation = occupation;
    return this;
  },
  setID: function(id) {
    this.id = function() {
      return id;
    }
    return this;
  },
  equals: function(otherContact) {
    return this.id() === otherContact.id();
  },
  matches: function(id) {
    return this.id() === id;
  },
  toDataObject: function() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      occupation: this.occupation,
      id: this.id(),
    }
  },
}

var ContactList = {
  sort: function() {
    this.list.sort(function(a, b) {
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      else if (nameA > nameB) return 1;
      else return 0;
    });
  },
  length: function() {
    return this.list.length;
  },
  toStorageList: function() {
    return this.list.map(contact => contact.toDataObject());
  },
  loadStoredList: function(storedList) {
    this.list = storedList.map(function(contact) {
      return Object.create(Contact).init(contact.name, contact.email, contact.phone, contact.occupation)
                                   .setID(contact.id);
    });
  },
  loadData: function() {
    var storedList = JSON.parse(localStorage.getItem('contactList'));
    !!storedList ? this.loadStoredList(storedList) : this.list = [];
    this.serialID = +localStorage.getItem('serialID') || 1;
  },
  saveData: function() {
    localStorage.setItem('contactList', JSON.stringify(this.toStorageList()));
    localStorage.setItem('serialID', this.serialID);
  },
  add: function(contact) {
    this.list.push(contact);
    this.sort();
  },
  delete: function(id) {
    this.list = this.list.filter(function(contact) {
      return !contact.matches(id);
    });
  },
  filter: function(tags, query) {
    result = [];
    this.list.forEach(function(contact) {
      var occupation = contact.occupation;
      var name = contact.name.toLowerCase();
      if (tags.includes(occupation) && name.slice(0, query.length) === query) {
        result.push(contact);
      }   
    }.bind(this));

    return result;
  },
  find: function(id) {
    var result = this.list.find(function(contact) {
      return contact.matches(id);
    });

    return result;
  },
  update: function(updatedContact) {
    var index = this.list.findIndex(original => original.equals(updatedContact));
    this.list.splice(index, 1, updatedContact);
    this.sort();
  },
  init: function() {
    this.loadData();
    return this;
  },
}

var ContactManager = {
  registerHandlers: function() {
    this.$addContact.on('click', this.handleOpenCreateForm.bind(this));
    this.$contacts.on('click', '.delete', this.handleDeleteContact.bind(this));
    this.$contacts.on('click', '.edit', this.handleUpdate.bind(this));
    this.$search.on('click keyup', this.handleSearch.bind(this));
    /* form handlers */
    this.$reset.on('click', this.setAllValid.bind(this));
    this.$form.on('keypress', 'input', this.handlePreventBadInput.bind(this)); 
    this.$submitBTN.on('click', this.handleSubmit.bind(this));
    this.$cancel.on('click', this.handleCancel.bind(this));
    this.$form.on('blur', 'input', this.handleBlurValidate.bind(this));
  },
  loadAllContacts: function() {
    this.loadContacts(this.contactList.list);
  },
  loadContacts: function(contactArray) {
    this.clearAllContacts();
    contactArray.forEach(contact => this.insertNewContact(contact));
  },
  clearAllContacts: function() {
    $('.contact').remove();
  },
  handleDeleteContact: function(e) {
    var $contact = $(e.target.closest('.contact'));
    var id = +$contact.attr('data-id');
    this.contactList.delete(id);
    $contact.remove();
    this.handleCancel();
    this.contactList.saveData();
  },
  handleOpenCreateForm: function() {
    if (this.$submitBTN[0].hasAttribute('data-updating')) {
      this.$submitBTN.removeAttr('data-updating');
      this.$formHeader.html('Create Contact');
      this.clearForm();
    }
    this.setAllValid();
    this.openForm();
  },
  openForm: function() {
    this.hideNotices();
    this.$tools.slideUp();
    this.$contacts.slideUp();
    this.$createContact.slideDown();
  },
  /* SEARCH*/
  handleSearch: function(e) {
    this.clearAllContacts();
    var activeTags = this.activeTags();
    var query = this.$searchBar.val().toLowerCase();
    var contactArray = this.contactList.filter(activeTags, query);
    this.loadContacts(contactArray);
    this.noContactsNotices();
  },
  activeTags: function() {
    var activeTags = [];
    var tags = this.$searchTags;
      tags.each(function(i) {
        if (tags[i].checked) activeTags.push(tags[i].getAttribute('data-tag'))
      });
    return activeTags;
  },
  resetSearch: function() {
    this.$search.val('');
    this.$searchTags.prop('checked', true);
  },
  noContactsNotices: function() {
    if (this.$contacts.children('.contact').length === 0) {
      if (this.contactList.length() === 0) {
        this.$noTags.slideUp();
        this.$noResults.slideUp();
        this.$noContacts.slideDown();
      } else if (this.activeTags().length === 0) {
        this.$noContacts.slideUp();
        this.$noResults.slideUp();
        this.$noTags.slideDown(); 
      } else {
        this.$noContacts.slideUp();
        this.$noTags.slideUp();
        this.$noResults.slideDown()
        this.$tags.html(this.activeTags().join(' or '));
        if (this.$searchBar.val().length === 0) {
          this.$starting.hide();
        } else {
          this.$starting.show();
          this.$starting.children('em').html('"' + this.$searchBar.val() + '"');
        }
      }
    } else {
      this.hideNotices();
    }
  },
  hideNotices: function() {
    this.$noContacts.slideUp();
    this.$noTags.slideUp();
    this.$noResults.slideUp();
  },
  /* FORMS */
  handleSubmit: function(e) {
      e.preventDefault();
      var updateID = +this.$submitBTN.attr('data-updating') || null;
      if (this.validInput()) {
        var contact = Object.create(Contact);
        contact.init(this.formInput());

        if (updateID) {
          contact.setID(updateID);
          this.contactList.update(contact);
        } else {
          contact.setID(this.contactList.serialID++);
          this.contactList.add(contact);
        }
        this.loadAllContacts();
        this.handleCancel();
        this.clearForm();
        this.contactList.saveData();
      }
  },
  populateForm: function(contact) {
    this.$fullName.val(contact['name']);
    this.$email.val(contact['email']);
    this.$phone.val(contact['phone']);
    $('#' + contact['occupation']).prop('checked', true);
  },
  handleUpdate: function(e) {
    var id = $(e.target).closest('.contact').attr('data-id');
    var contact = this.contactList.find(+id);
    this.openForm();
    this.populateForm(contact);
    this.validInput();
    this.$formHeader.text('Edit Contact');
    this.$submitBTN.attr('data-updating', id);
  },
  handleCancel: function() {
    this.$createContact.slideUp();
    this.$contacts.slideDown();
    this.$tools.slideDown();

    this.loadAllContacts();
    this.resetSearch();
    this.noContactsNotices();
  },
  clearForm: function() {
    $('button[type=reset]').trigger('click');
  },
  insertNewContact: function(contact) {
    var contactData = contact.toDataObject();
    var source = $('#entry-template').html();
    var template = Handlebars.compile(source);
    this.$contacts.append(template(contact)).children('.contact:last-child').attr('data-id', contactData.id);
  },
  formInput: function(e) {
    return {name: this.$fullName.val(), email: this.$email.val(), phone: this.$phone.val(), occupation: $('input[name=occupation]:checked').val()};
  },
  /* VALIDATION */
  handlePreventBadInput: function(e) {
    if ($(e.target).is(this.$fullName) && !e.key.match(/[a-zA-Z -]/)) e.preventDefault();
    if ($(e.target).is(this.$phone) && !e.key.match(/[0-9]/)) e.preventDefault();
  },
  handleBlurValidate: function(e) {
    var contact = this.formInput();
    if ($(e.target).is(this.$fullName)) this.invalidName();
    else if ($(e.target).is(this.$email)) this.invalidEmail();
    else if ($(e.target).is(this.$phone)) this.invalidPhone();
  },
  invalidName: function() {
    return !this.validateInput(this.$fullName, this.$fullName.val(), /^[\w\-]+[ \w\-]*$/);
  },
  invalidEmail: function() {
    return !this.validateInput(this.$email, this.$email.val(), /^[a-zA-Z1-9._]+@\w+\.[a-z]{2,5}$/);
  },
  invalidPhone: function() {
    return !this.validateInput(this.$phone, this.$phone.val(), /^(\d{3}[\.-]?){2}\d{4}$/);
  },
  invalidOccupation: function() {
    return !this.validateInput(this.$occupation, $('input[name=occupation]:checked').val(), '')
  },
  validInput: function(contact) {
    valid = true;
    if (this.invalidName()) valid = false;
    if (this.invalidEmail()) valid = false;
    if (this.invalidPhone()) valid = false;
    if (this.invalidOccupation()) valid = false;

    return valid;
  },
  validateInput: function(element, string, regex) {
    if (string === undefined || string === '' || !string.match(regex)) {
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
  init: function() {
    this.$createContact = $('#create_contact'),
    this.$tools = $('#tools');
    this.$contacts = $('#contacts');

    /* BUTTONS */
    this.$addContact = $('.add_contact');

    /* NOTICES */
    this.$noResults = $('#no_results');
    this.$noContacts = $('#no_contacts');
    this.$noTags = $('#no_tags');
    this.$tags = $('#tags');
    this.$starting = $('#starting');

    /* SEARCH */
    this.$search = $('#search');
    this.$searchBar = $('#search input[type=text]');
    this.$searchTags = $('input[name=search-tag]');

    /* FORM */
    this.$formHeader = $('#create_contact > h2');
    this.$form = $('form');
    this.$fullName = $('#full_name');
    this.$email = $('#email');
    this.$phone = $('#phone');
    this.$occupation = $('#occupation');

    /* FORM BUTTONS */
    this.$cancel = $('#cancel');
    this.$reset = $('#reset');
    this.$submitBTN = $('#submit');

    this.contactList = Object.create(ContactList).init();
    this.registerHandlers();
    this.contactList.loadData();
    this.loadAllContacts();
    this.noContactsNotices();
  }
}
var test = Object.create(ContactManager);
test.init();
