import { Meteor } from 'meteor/meteor';


Meteor.publish('groups', function( userId ) {
	if(this.userId === undefined) {
		throw new Error('You are not autorized');
	}
	var Groups1 =  Groups.find({'$or': [{'userId': this.userId}, {'users': this.userId}]});
	return Groups1;
});

Meteor.publish('menu', function() {
	return Menu.find({});
});
// _users_select
Meteor.methods({
	_create_groups: function( data ) {
			var allow;
			var found;
			var data = data;
			var currentUser;

		if(!Match.test(data, Object))
			return;

	if(data.userId != Meteor.userId() || data.userId === undefined) {
			throw new Meteor.Error('You are not autorized!');
			return;
	}

		allow = data.groupName.search(/^[a-z][a-z0-9_]{3,13}[a-z0-9]$/ig);
		currentUser = Meteor.users.findOne({_id: Meteor.userId()});
		if( currentUser.emails === undefined)
			data.email = currentUser.services.google.email;
		else
			data.email = currentUser.emails[0].address;
		found = Groups.findOne({
														groupName: data.groupName
													});
		if(found !== undefined || allow === -1 ) {
			return;
		}
		data.eventsHistory = [];
		data.currentEvent = {
			'status': false
		};

		Groups.insert(data);


	},
	'_create_event': function( userId, groupName ) {
		if(userId !== Meteor.userId() || Meteor.userId() === undefined) {
			throw Meteor.Error();		return;
		}

		var currentEvent = {
					'date': new Date(),
					'status': 'ordering' , //ordering, ordered, delivering, delivered

					'subscribers': {},
					'menuOrdered': {},
					'discount': {},
			}

			var users = Groups.findOne({
				'userId': Meteor.userId(),
				'groupName': groupName
			}, {fields: {users: 1} } );

			users.users.forEach(function(user) {
				currentEvent.subscribers[user] = 0;
			});

			Groups.update({
				'userId': Meteor.userId(),
				'groupName': groupName
			}, {
				$set: {'currentEvent': currentEvent}
			});

			var currentUserNew = Groups.findOne({
				'userId': Meteor.userId(),
				'groupName': groupName
			}, {fields: {currentEvent: 1}} );

	},
	_up_event_answer: function( userId, data ) {
		if(Meteor.userId() !== userId || userId === undefined) {
			throw Meteor.Error('You have not authorized');
			return;
		}
		check(data, Array);

		var data = data;
		data.forEach(function( answer ) {
			var roote = 'currentEvent.subscribers.'+userId;
			Groups.update({
				groupName: answer.groupName,
				email: answer.email,
			}, {
				$set: {[roote]: answer.userAnswer}
			});
		});

	},
	_remove_groups: function( data ) {
		var	config = {};
		var userId =  data.userId;

		if( userId !== Meteor.userId() || Groups.findOne({'userId': userId}) === undefined )
			return;

			config.userId = userId;
			config.groupName = data.groupName;
			Groups.remove(config);
			return config;
	},
	'_users_select': function( allow, _config ) {
		var listUsers,
				modifiedList,
				config;
			if( !allow ) return;

			if(_config !== undefined && Match.test(_config, Object))
				config = _config;
			else {
				throw new Meteor.Error('Match test hasn\'t passed');
				return;
			}

			modifiedList = [];
			listUsers = Meteor.users.find(_config).fetch();

		if(listUsers != null)
				listUsers.forEach( function( user ) {
					if(user.emails !== undefined) {
							modifiedList.push({
								userName: user.profile['first-name'] + ' ' + user.profile['last-name'],
								email: user.emails[0].address,
								_id: user._id
							});
					} else {
							modifiedList.push({
								userName: user.services.google.name,
								email: user.services.google.email,
								_id: user._id
							});
					}
				});

			return modifiedList;

	},
	'_upsert_menu_item': function( userId, groupName, _root, data ) {
		if(userId !== Meteor.userId() || Meteor.userId() == undefined) {
			throw new Meteor.Error('You are not autorized');
			return;
		}

		check(groupName, String);
		check(_root, String);

			var g = Groups.upsert({
					'groupName': groupName
			},{'$set':{[_root]: data}
			});
	},
	'_remove_menu_item': function(userId, groupName, _root) {
		if(userId !== Meteor.userId() || Meteor.userId() == undefined) {
			throw new Meteor.Error('You are not autorized');
			return;
		}

		check(groupName, String);
		check(_root, String);

			var removed = Groups.update({
				'groupName': groupName
			},{
				'$unset': {[_root]: ""}
			});
	},
	'group_exist': function( userId, groupName, _root, data ) {
		var config;
		if(userId !== Meteor.userId() || Meteor.userId() == undefined) {
			throw new Meteor.Error('You are not autorized');
			return;
		}

		check(groupName, String);
		config = {};

		config.groupName = groupName;

		if(_root !== undefined && data !== undefined) {
			check(_root, String);
			config[_root] = data
		}

		var found = Groups.findOne( config ,{field: {groupName: 1}});

		if(found === undefined)
			return true;
		return false;

	},
	'_remove_add_item_array_group': function( userId, remAdd, groupName, _root, data ) {
		if(userId !== Meteor.userId() || Meteor.userId() == undefined) {
			throw new Meteor.Error('You are not autorized');
			return;
		}
		var $root = _root + '.$';

		 if(remAdd) {
				var g = Groups.update( {'groupName': groupName },	{
					$pull: {
						 	[_root] : data
						 }
				});

			} else {
				var h = Groups.update( {'groupName': groupName}, {
					$push: {
						 	[_root] : data
						 }
				});
			}
	},

});





