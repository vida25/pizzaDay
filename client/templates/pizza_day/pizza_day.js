Template.pizzaDay.onCreated(function() {
	Meteor.subscribe('groups', Meteor.userId());
	this.eventsOffer = new ReactiveVar(null);
});

Template.pizzaDay.onRendered(function() {

});

Template.pizzaDay.onDestroyed(function() {

});


Template.pizzaDay.helpers({
	'eventsOffered': function() {
		var conf = {
			[`currentEvent.subscribers.${Meteor.userId()}`]: 0,
			'currentEvent.status': 'ordering'
		};
		var Offered = Groups.find(conf).fetch();
		Template.instance().eventsOffer.set( Offered );
			return Offered;
	},
	'activeEvents': function() {
		var conf = {'$or': [
					{[`currentEvent.subscribers.${Meteor.userId()}`]: true,
					'currentEvent.status': {
						'$in':
							[
								'ordering', 'ordered', 'delivering', 'delivered'
							]
						}},
					{
						'userId': Meteor.userId(),
						'currentEvent.status': {
						'$in':
							[
								'ordering', 'ordered', 'delivering', 'delivered'
							]
						}}
				]
			};
		var groups = Groups.find(conf).fetch();

			for (var i = groups.length - 1; i >= 0; i--) {
				var a = groups[i];
				var isOrdered = a.currentEvent.menuOrdered[Meteor.userId()];
				var status = a.currentEvent.status;
				var d = a.currentEvent.date;
				var day = (d.getDate() > 9)?(d.getDate()):('0' + d.getDate());
				var month = (d.getMonth() + 1 > 9)?(d.getMonth() + 1):('0' + (d.getMonth() + 1));
				var year = d.getFullYear();
				var minuts = (d.getHours() > 9)?(d.getMinutes()):('0' + d.getMinutes());
				var hours = (d.getHours() > 9)?(d.getHours()):('0' + d.getHours());
				var date = hours +':' +  minuts + ' ' + day+'.' +month+'.'+year;
						a.currentEvent.date = date;
				if(isOrdered == undefined && status === 'ordering'){
					a.allowOrder = true;
				}	else {
					a.allowOrder = false;
				}
				if(a.userId === Meteor.userId()) {
					a.allowChangeStatus = true;
				}	else {
					a.allowChangeStatus = false;
				}


			}

			if(groups.length === 0)
				return false;
			return groups;
	},

	'userId': function() {
		var _id = Meteor.userId();
		return _id;
	},
});

Template.pizzaDay.events({
	'click span.glyphicon-bell': function(e, tmpl) {
		var _target = $(e.currentTarget);
		_target.css({'color': 'lightgreen'});
		$('#subNewEvents').modal('show');
	},
	'click button[name=save_event_btn]': function(e, tmpl) {
		var eventsOffer = tmpl.eventsOffer.get();
		var radioArr = $('#subNewEvents').find('input[type=radio]');
		var userSubscr = [];

			for (var i = radioArr.length - 1; i >= 0; i--) {
				var radio = radioArr[i];
				if(!radio.checked) continue;
				var name = radio.name.trim(),
						value = radio.value.trim();
						for (var i = eventsOffer.length - 1; i >= 0; i--) {
							var event = eventsOffer[i];
							if(event.groupName + event.email == name) {
								userSubscr.push({
									groupName: event.groupName,
									email: event.email,
									userAnswer: !!value
								});
								continue;
							}
						}
			}
			Meteor.call('_up_event_answer', Meteor.userId(), userSubscr);
			$('#subNewEvents').modal('hide');

	},
	'click div[name=pizza_day_order] > label': function(e, tmpl) {
		var _target = $(e.target);
		var _container = $('div[name=pizza_day_order] ');
			_container.animate({'margin-top': '60px'});
		var labels = $('div[name=pizza_day_order] > label');
		if(_target.next().hasClass('hidden')) {
			labels.next().hide('slow');
			setTimeout(function() {
				labels.next().not(_target.next()).addClass('hidden');
			}, 600);
			_target.next().removeClass('hidden').show('slow');
		} else {
			_target.next().hide('slow');
			setTimeout(function() {
			_container.animate({'margin-top': '15%'});
				_target.next().addClass('hidden');
			}, 600);
		}
	}
});


