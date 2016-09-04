var userListReactive = new ReactiveVar(null);

Template.Groups.onCreated(function() {
	Meteor.subscribe('groups', Meteor.userId());
	this.groupNameReact = new ReactiveVar(null);
	this.groupNameLogo = new ReactiveVar(null);
	this.groupUsersInOut = new ReactiveVar(null);
});

Template.Groups.onRendered(function() {

});
// _create_event
Template.Groups.onDestroyed(function() {

});
// _users_select
/*//	helpers
			// allGroupsCollection
			// allUsers
			// groups_you_invited
*///

Template.Groups.helpers({
	'yourGroups': function() {
		var groups = Groups.find({
														userId: Meteor.userId()
												})
												.fetch();

		if(groups !==  undefined)
			return groups;
		return false;
	},
	'allUsers': function() {
		var userList = userListReactive.get();
		// console.log('userList', userList);
		if(userList !== null) return userList.filter(function( user ) {
			return user._id !== Meteor.userId();
		});

	},
	'usersOutInGroup': function() {
		var usersInOut = {};
		var instance = Template.instance();
		var users;
		var group;
			if(instance.groupUsersInOut.get() === null) return;
			if(userListReactive.get() === null) return;

		var groupName = instance.groupUsersInOut.get();
		var userList = userListReactive.get();

			group = Groups.findOne({'groupName': groupName},{'users': 1});
				if(group === undefined) return;

				users = group.users;

		var usersInGroup = userList.filter(function( user ) {
			return users.indexOf(user._id) !== -1;
		});

		var user_id = Meteor.userId();
		var usersOutGroup = userList.filter(function( user ) {
			return users.indexOf(user._id) === -1 && user._id !== user_id;;
		});

			usersInOut.usersOutOfGroup = usersOutGroup;
			usersInOut.usersInGroup = usersInGroup;
		return usersInOut;
	},
	'logotypes': function() {
		var logo = [
			{'src': 'img/menu_pizzaDay/default.jpg'},
			{'src': 'img/menu_pizzaDay/minion.jpg'},
			{'src': 'img/menu_pizzaDay/PIZZA.png'},
			{'src': 'img/menu_pizzaDay/pizza_100.png'},
			{'src': 'img/menu_pizzaDay/pizza_hut.png'},
			{'src': 'img/menu_pizzaDay/js.jpg'},
			{'src': 'img/menu_pizzaDay/android.png'},
			{'src': 'img/menu_pizzaDay/breckets.png'},
			{'src': 'img/menu_pizzaDay/smile.jpg'},
			{'src': 'img/menu_pizzaDay/algo.png'},
		];

		return logo;
	},
	'groups_you_invited_in': function() {
		var groups = Groups.find({'users': Meteor.userId() })
												.fetch();
			// console.log('groups', groups);
		if(groups === undefined || groups == [])
			return null;
		return groups;
	}
});

/*
//  events
		// 	'click span[name=create_event]
		// 	'input #event_name_input'
		//	'click #modalCrEvConf button[name=cr_event]
		// 'click span.glyphicon-remove'								remove Group
		// 'click span[name=select_all]'								all checkboxes checked
		// 'click a[href=#add_group]'										add Group
		// 'click button[name=save_group]'							save Group
		// 'input input[name=input_group_name]'					input field's validation
		// 'click input[name=check_box_select_users]			checkbox select users
*/


Template.Groups.events({
	'click small[name=create_event]': function(e, tmpl) {
		var _target = $(e.target);
		var modal = $('#modalCrEvConf');
		var found;
		var container = $(e.target).parent().parent().parent();
		var groupName = container
														.find('img')
														.data('group')
														.trim();
			tmpl.groupNameReact.set(groupName);
			modal.find('#group_name_event').text(groupName);
			found = Groups.findOne({
				groupName: groupName,
				'currentEvent.status': false
			},{fields: {currentEvent: 1}});
			modal.modal('show');
	},


	'click #modalCrEvConf button[name=cr_event]': function(e, tmpl) {
		var _target = $(e.target);
		var groupName = $('#group_name_event').text().trim();

		Meteor.call('_create_event', Meteor.userId(), groupName);
		$('#modalCrEvConf').modal('hide');

	},
	'click #add_users_to_group button[name=addUsers]': function(e, tmpl) {

	},
	'click small[name=group_remove]': function(e, tmpl) {
		var container = $(e.target).parent().parent().parent();
		var groupName = container
														.find('img')
														.data('group')
														.trim();

		var data = {
			'userId': Meteor.userId(),
			'groupName': groupName
		};
		Meteor.call('_remove_groups', data, function(error, rezult) {
			// console.log(rezult);
		});
	},

	'click a[name=select_all]': function(e, tmpl) {
		var check = $('#add_group');
		var _target = $(e.target);
			if(_target.text().trim() === 'select') {
				check
						.find('input[name=check_box_select_users]')
						.prop('checked', true);
				_target.text('unselect');
			}	else {
				check
						.find('input[name=check_box_select_users]')
						.prop('checked', false);
				_target.text('select');
			}
	},

	'click a[href=#add_group]': function(e, tmpl) {
		Meteor.call('_users_select', true, {}, function( error, rezult ) {
			userListReactive.set(rezult);
		});
		$('a[name=select_all]').text('select');
	},

	'click #add_group button[name=save_group]': function(e, tmpl) {
		var button = $(e.target);
			if(button.hasClass('disabled')) return;
		var input = $('input[name=input_group_name]');
		var groupName = input.val().trim();
		var userList = userListReactive.get();
		var usersArr = [];
		var data;
		var checkboxes = $("#add_group")
												.find("input[name=check_box_select_users]");

		checkboxes.val(function(index, val) {
			if($(this).prop('checked')) {
				var email = $(this).parent().data('email');
				var l = userList.length;
				for (; l--; ) {
					if(userList[l].email == email) {
						usersArr.push( userList[l]._id );
						break;
					}
				}
			}
		});

		data = {
			'groupName': groupName,
			'users': usersArr,
			'userId': Meteor.userId(),
			'logo': 'img/menu_pizzaDay/default.jpg'
		}

		button.addClass('disabled');
		input.val('');
			checkboxes.attr('checked', false);
		Meteor.call('_create_groups', data, function(e, r) {
			// console.log('rezult', r);
		});
	},

	'input input[name=input_group_name]': function(e, tmpl) {
		var groupName = $(e.currentTarget).val();
		var allow = groupName.search(/^[a-z][a-z0-9_]{3,13}[a-z0-9]$/ig);
		var found;
		var _target = $(e.currentTarget);
		var saveButton;
			saveButton = $('button.btn-primary');

		if(allow !== 0) {
				_target.addClass('bg-danger');
				saveButton.addClass('disabled');
				return;
		}

			Meteor.call('group_exist', Meteor.userId(),groupName, function(e, r) {
				if(e) {
					throw new Meteor.Error(e);
				}

				if(r) {
						_target.removeClass('bg-danger');
						saveButton.removeClass('disabled');
						return;
					}
						_target.addClass('bg-danger');
						saveButton.addClass('disabled');
			});

	},
	'click button[name=select_logo]': function(e, tmpl) {
		$('#modal_select_logo').modal('show');
	},
	'click #your_groups img': function(e, tmpl) {
		$('#select_logo').modal('show');
		tmpl.groupNameLogo.set($(e.target).data('group'));
	},
	'click #select_logo input[type=radio]': function(e, tmpl) {
		var target = $(e.target);
		var images = $('#select_logo img').css({'border': 'none'});
		var clickedImg = target.next().find('img');
		var saveButton = $('#save_logo');
			if(saveButton.hasClass('hidden'))
				saveButton.removeClass('hidden');
		clickedImg.css({'border': '1px solid blue'});
	},
	'click #save_logo': function(e, tmpl) {
		var target = $(e.target);
		var selected = $('#select_logo input[type=radio]').filter(':checked');
		var clickedImg = selected.next().find('img');
		var src = clickedImg.prop('src');
		var _root = 'logo';
		var groupName = tmpl.groupNameLogo.get();


		Meteor.call('_upsert_menu_item',Meteor.userId(), groupName, _root, src);

			$('#select_logo').modal('hide');

		target.addClass('hidden');

	},
	'click #your_groups .glyphicon-user': function(e, tmpl) {
		var target = $(e.target);
		var container = target.parent().parent().parent();
		var groupName = container.find('img').data('group').trim();

			Meteor.call('_users_select', true, {}, function( error, rezult ) {
				userListReactive.set(rezult);
			});

			tmpl.groupUsersInOut.set(groupName);
			$('#m_users_group_config').modal('show');
	},
	'click #add_users_to_group button[name=addUser]': function(e, tmpl) {
		var target = $(e.target);
		var groupName = tmpl.groupUsersInOut.get();
		var container = target.parent();
		var email = container.data('email').trim();
		var userList = userListReactive.get();
		var data;
		var user = userList.filter(function( user ) {
			return user.email === email;
		});

		_root = 'users';
		data = user[0]._id;
		Meteor.call('_remove_add_item_array_group', Meteor.userId(), false, groupName, _root, data);

	},
	'click #delete_users_from_group button[name=removeUser]': function(e, tmpl) {
		var target = $(e.target);
		var groupName = tmpl.groupUsersInOut.get();
		var container = target.parent();
		var email = container.data('email').trim();
		var userList = userListReactive.get();
		var data;
		var user = userList.filter(function( user ) {
			return user.email === email;
		});

		_root = 'users';
		data = user[0]._id;
		Meteor.call('_remove_add_item_array_group', Meteor.userId(), true, groupName, _root, data);

	},

});

