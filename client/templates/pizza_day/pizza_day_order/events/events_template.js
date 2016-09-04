Template.EventsTemplate.onCreated(function() {
	Meteor.subscribe('groups', Meteor.userId());
	this.groupName_order = new ReactiveVar(null);
	this.groupName_status = new ReactiveVar(null);
	this.usersInfoReact = new ReactiveVar(null);
	this.groupOrderPreview = new ReactiveVar(null);
	this.groupDiscount = new ReactiveVar(null);
});

Template.EventsTemplate.onRendered(function() {

});

Template.EventsTemplate.onDestroyed(function() {

});
Template.EventsTemplate.helpers({
	'menu_item_order': function() {
		var groups = Groups.find({'$or': [
				{
					[`currentEvent.subscribers.${Meteor.userId()}`]: true,
					'groupName': groupName
				},
				{
					'userId': Meteor.userId(),
					'groupName': groupName
				}
			]});
	},
	'menuItemsOrder': function() {
		var groupName = Template.instance().groupName_order.get();
		var menuItemsObj = Groups.find({
			'groupName': groupName
		}, {'fields': {menu: 1}}).fetch();
		var menuArr = [];
		menuItemsObj.forEach(function( obj ) {
			var menu = obj.menu;
			for(var cat in menu) {
					if(cat === '_id') continue;
					var catR = {
						'categoryItem': cat,
						'content': []
					}
					for(var i in menu[cat]) {
						catR.content.push({
								'iName': i,
								'price': menu[cat][i][0],
								'description': menu[cat][i][1]
						})
					}
					menuArr.push(catR);
			}
		});
		return menuArr;
	},
	'users_status': function() {
		var _instance = Template.instance();
		var usersInfo = _instance.usersInfoReact.get();
		var groupName = _instance.groupName_status.get();

			if(usersInfo == null || groupName == null)
				 return false;

		var group = Groups.findOne({groupName: groupName},
																			{fields: {currentEvent: 1}});

		if(group === undefined) return;
		if(group.currentEvent.status === false) return;

		var menuOrdered = group.currentEvent.menuOrdered;
		var ownerEmail;
		var curStatus = group.currentEvent.status;
		var length = usersInfo.length;
		var positive = 0;
		var object = {};
		var users_status = usersInfo.map(function( user ) {
				var ready;
				if(menuOrdered[user._id] === undefined) {
					ready = false;
				} else {
					ready = true;
					positive++;
				}

				if(user._id == Meteor.userId() && curStatus == 'ordering') {
					ownerEmail = user.email;
				}

				var obj = {'userName': user.userName,
									'email': user.email,
									'ready': ready };
					return obj;
		});

		object.ownerEmail = ownerEmail;
		object.users_status = users_status;

		return object;
	},
	'orderPreview': function() {
		var orderPreview = {};
		var instance = Template.instance();
		var groupName = instance.groupOrderPreview.get();
			if(groupName === null) return;

		var group = Groups.findOne({
			'groupName': groupName
		}, {field: {currentEvent: 1, menu: 1}});

			if(group === undefined) return;

		var id = Meteor.userId();
		var currentEvent = group.currentEvent;
			if(currentEvent.status === false)
				return;
		var yourOrder = currentEvent.menuOrdered[id];
			if(yourOrder == undefined) return false;
		var menu = group.menu;
		var total = 0;
		var discount;

		if(currentEvent.discount[Meteor.userId()] !== undefined) {
			discount = currentEvent.discount[Meteor.userId()];
		}	else {
			discount = 0;
		}

		var order = yourOrder.map(function( item ) {
				var c = item.category,
						n = item.itemName,
						p = Number(menu[c][n][0]);
				item['price'] = p;
				total += p*Number(item.count);
				return item;
		});
	orderPreview['order'] 		= order;
	orderPreview['total'] 		= total.toFixed(2);
	orderPreview['discount']	= discount.toFixed(2);
	orderPreview['toPay'] 		= (total - discount).toFixed(2);

		return orderPreview;
	},
	'menuItems': function(e, tmpl) {
		var groupName = Template.instance().groupDiscount.get();
		var menuItemsObj = Groups.find({
			'groupName': groupName
		}, {'fields': {menu: 1}}).fetch();
		var menuArr = [];

		if(menuItemsObj === undefined) return false;

		menuItemsObj.forEach(function( obj ) {
			var menu = obj.menu;
			for(var cat in menu) {
					if(cat === '_id') continue;
					var catR = {
						'categoryItem': cat,
						'content': []
					}
					for(var i in menu[cat]) {
						catR.content.push({
								'iName': i,
								'price': menu[cat][i][0],
						})
					}
					menuArr.push(catR);
			}
		});

		return menuArr;
	},

});



Template.EventsTemplate.events({
	'click #active_events button[name=make_order]': function(e,tmpl) {
		var _target = $(e.target);
		var groupName = _target.parent().parent()
																		.find('div[name=group_name]')
																		.text()
																		.trim();
			tmpl.groupName_order.set(groupName);
			$('#m_your_order').modal('show');
	},
	'click #m_your_order button[name=complOrder]': function(e, tmpl) {
		var groupName;
		var _root;
		var selected = $('#m_your_order').find('input[type=checkbox]:checked');
		if(selected[0] === undefined) {
			alert('Select some items first and save your order.')
			return;
		}
		var data = []; // category, name, count;

		selected.each(function(index, elem) {
			var c = elem.name.split('.');
			var count = $(elem).parent().parent()
											.find('input[type=number]')
											.val();
			data.push({
				'category': c[0],
				'itemName': c[1],
				'count': parseInt(count)});
		});

		groupName = tmpl.groupName_order.get();
		_root = 'currentEvent.menuOrdered.' + Meteor.userId();
		Meteor.call('_upsert_menu_item',Meteor.userId(), groupName, _root, data);
		$('#m_your_order').modal('hide');
	},
	'click #active_events button[name=change_status]': function(e, tmpl) {
		var _target = $(e.target);
		var groupName = _target.parent().parent()
																.find('div[name=group_name]')
																.text()
																.trim();
		var curGroup = Groups.findOne({'groupName': groupName });
			if(curGroup === undefined) return;
		var users = [];
		var subscribers = curGroup.currentEvent.subscribers;
			users.push({'_id': curGroup.userId});


		for(var sub in subscribers) {
			if(subscribers[sub] === true)
				users.push({'_id': sub});
		}
		var status = [
			'ordering', 'ordered', 'delivering', 'delivered'
		];
		var config = {'$or': users};
				tmpl.groupName_status.set(groupName);
		var curEvent = Groups.findOne({'groupName': groupName},{fields: {currentEvent: 1}});
			if(curEvent === undefined) return;
		var curStat = curEvent.currentEvent.status;
		var num = status.indexOf(curStat);
		$('#current_status_show').text(curStat);
			if(num > 2) {
				$('#delete_event').removeClass('hidden');
				$('#btn_change_stat').addClass('hidden');
			} else {
				$('#delete_event').addClass('hidden');
				$('#btn_change_stat').removeClass('hidden');
			}

			Meteor.call('_users_select', true, config, function(e, r) {
				tmpl.usersInfoReact.set(r);
			} );

			$('#btn_change_stat').parent().attr('name', groupName);
			$('#delete_event').parent().attr('name', groupName);
			$('#m_change_status').modal('show');

	},
	'click #price_of_order': function(e, tmpl) {
		var target = $(e.target);
		var groupName = target.parent().parent()
																.find('div[name=group_name]')
																.text()
																.trim();
		var curGroup = Groups.findOne({'groupName': groupName });
			if(curGroup === undefined) return;
		tmpl.groupOrderPreview.set(groupName);
			$('#modal_order_preview').modal('show');

	},
	'click #modal_discount_show': function(e, tmpl) {
		var target = $(e.target);
		var groupName = target.parent().parent()
																.find('div[name=group_name]')
																.text()
																.trim();
		var curGroup = Groups.findOne({'groupName': groupName });
			if(curGroup === undefined) return;

		tmpl.groupDiscount.set(groupName);
		$('#m_add_discount').modal('show');
	},
	'click #add_discount': function(e, tmpl) {
		var groupName;
		var _root;
		var selected = $('#m_add_discount').find('input[type=checkbox]:checked');
		var usersId = {};
		var currentEvent;
		var menuOrdered;
		var curGroup;
		var discount;
		var menu;
		var itemCounted;
		if(selected[0] === undefined) {
			alert('Select some items first and save your order.');
			return;
		}
		var data = []; // category, name, count;

		selected.each(function(index, elem) {
			var c = elem.name.trim().split('.');
			var count = $(elem).parent().parent()
											.find('input[type=number]')
											.val();

			data.push({
				'category': c[0],
				'itemName': c[1],
				'count': parseInt(count)});
		});

		groupName = tmpl.groupDiscount.get().trim();
		curGroup = Groups.findOne({'groupName': groupName}, {fields: {
			currentEvent: 1,
			menu: 1
		}});

		if(curGroup === undefined) {
			throw new Meteor.Error('Group undefined');
			return;
		}

		menu = curGroup.menu;
		itemCounted = {};
		menuOrdered = curGroup.currentEvent.menuOrdered;

	for(var id in menuOrdered) {
		var userOrder = menuOrdered[id];
		var l = data.length;
			usersId[id] = [];
		for(;l--;) {
			var d = userOrder.length;

			for(;d--;) {
				if(data[l]['category'] === userOrder[d]['category']) {
					if(data[l]['itemName'] === userOrder[d]['itemName']) {
						var category = userOrder[d]['category'],
								itemName = userOrder[d]['itemName'],
								count = userOrder[d]['count'];
						usersId[id].push({'category': category,
														'itemName': itemName,
														'count': count
													});

					if(itemCounted[category] === undefined)
						itemCounted[category] = {};

					if(itemCounted[category][itemName] === undefined)
						itemCounted[category][itemName] = 0;

					itemCounted[category][itemName] += count;
							break;
					}
				}
			}
		}
	}

		discount = {};

		for(var id in usersId) {
			var userOrderToSale = usersId[id];

			discount[id] = 0;
			userOrderToSale.forEach(function( item ) {
				var l = data.length;
				var c;
				var category = item.category,
						itemName = item.itemName,
						count = item.count,
						price = menu[category][itemName][0],
						totalCount = itemCounted[category][itemName];
					for(;l--;) {
						if(data[l]['category'] == category && data[l]['itemName'] == itemName) {
							c = +data[l].count;
							break;
						}
					}
				var	sale = ((price * c) / totalCount) * count;
				discount[id] += +parseFloat(sale).toFixed(2);

			});
		}
	_root = 'currentEvent.discount';

		Meteor.call('_upsert_menu_item',Meteor.userId(), groupName, _root, discount);
	},

});

