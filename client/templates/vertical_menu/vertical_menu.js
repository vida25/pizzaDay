/*Template.verticalMenu.onCreated(function() {
	Meteor.subscribe('groups', Meteor.userId());
});

Template.verticalMenu.onRendered(function() {

});

Template.verticalMenu.onDestroyed(function() {

});

Template.verticalMenu.helpers({
	'menuItem': function() {
		var menuItem = [];

		menuItem.push({
			'name': 'Pizza Day',
			'config': [
				{	route: 'add_new_group', subMenu: 'Add new Group' },
				{	route: 'view_my_groups', subMenu: 'View my Groups'	},
				{	route: 'groupsAdd', subMenu: 'Remove some Group'	},
			]
		});


		return menuItem;

	},
	'userId': function() {
		var userId = Meteor.userId();
		return userId;
	}
})

Template.verticalMenu.events({
	'click li a[href=add_new_group]':function(e, tmpl) {
		e.preventDefault();
		$('#add_new_group_modal').modal('show');
	},
	'click li a[href=view_my_groups]':function(e, tmpl) {
		e.preventDefault();
		$('#show_all_group_modal').modal('show');
	}
})*/