Template.modalChangeStatus.onCreated(function() {
	Meteor.subscribe('groups');
});

Template.modalChangeStatus.onRendered(function() {

});

Template.modalChangeStatus.onDestroyed(function() {

});

Template.modalChangeStatus.helpers({



});



Template.modalChangeStatus.events({
	'click #btn_change_stat': function(e, tmpl) {
		var target = $(e.target);
		var group = target.parent().attr('name').trim();
		var curEvent = Groups.findOne({'groupName': group},{fields: {currentEvent: 1}});

		if(curEvent === undefined) return;

		var curStat = curEvent.currentEvent.status;

			var data = tmpl.data.users_status;
			var ready = 0;
			data.forEach( function( user ) {
				if(user.ready === true)
					ready++;
			});
			if(ready < data.length) {
				var c = confirm('Only '+ready+' users have made their choice. Do you want to change status nevertheless? ');
				if(!c) return;
			}
		var status = [
			'ordering', 'ordered', 'delivering', 'delivered'
		];
		var num = status.indexOf(curStat);
		var _root = 'currentEvent.status';

		$('#current_status_show').text(status[num + 1]);

			if(num === 0) {
				target.addClass('hidden');
				Meteor.setTimeout(function() {
					if(target !== undefined)
						target.removeClass('hidden');
				}, 2000);
					var email = tmpl.data.ownerEmail;
					var password = $('#password_email_url').val().trim();
					var allow = password.search(/^[a-z0-9_][a-z0-9_]{3,30}[a-z0-9_]$/ig);
						if(allow !== 0) {
							alert('You have inputed wrong password. Try again');
							return;
						}
					var auntefication = {
						email: email,
						password: password
					}
					Meteor.call('sendEmail', auntefication ,group, function(e, r) {
						if(e) {
							alert('You inputed incorrect password. Try again');
							return;
						}

						Meteor.call('_upsert_menu_item', Meteor.userId(), group, _root, status[(num + 1)]);
					});
			}

		if(num > 1) {
			$(e.target).addClass('hidden');
			$('#delete_event').removeClass('hidden');
		}

		if(num > 0) {
			Meteor.call('_upsert_menu_item', Meteor.userId(), group, _root, status[(num + 1)]);
		}

		if(num === (status.length - 1) ) {
			$('#send_event_history').removeClass('hidden');
			return;
		}



	},
	'click #delete_event': function(e, tmpl) {
		var group = $(e.target).parent().attr('name').trim();
		var curEvent = Groups.findOne({'groupName': group},{fields: {currentEvent: 1}});

		if(curEvent === undefined) return;

		var curStat = curEvent.currentEvent.status;

		var _root = 'currentEvent';
		var data = currentEvent = {
			'status': false
		};


// userId, groupName, _root, data
		Meteor.call('_upsert_menu_item', Meteor.userId(), group, _root, data);

		setTimeout(function() {
			$('#m_change_status').modal('hide');
		}, 2e2);
	}
});


