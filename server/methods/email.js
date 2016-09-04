
Meteor.startup(function() {
});
Meteor.methods({
	'sendEmail': function (auntefication, groupName) {
		check(auntefication, Object);
		check(auntefication.email, String);
		check(auntefication.password, String);

		check([groupName], [String]);

		var _this = this;
		var hostEmail = auntefication.email.replace('@', '%40');
		var hostPassword = auntefication.password;

// smtp://USERNAME:PASSWORD@HOST:PORT/
		process.env.MAIL_URL = 'smtp://'+hostEmail+':'+hostPassword+'@smtp.gmail.com:465/';

	var group = Groups.findOne({'groupName': groupName});

	var menuOrdered = group.currentEvent.menuOrdered;
	var subscribers = group.currentEvent.subscribers;
	var usersId = [];
	var menu = group.menu;
	var discount = group.currentEvent.discount;


		for(var sub in subscribers) {
			if(subscribers[sub] === true && menuOrdered[sub] !== undefined)
				usersId.push(sub);
		}
		if(menuOrdered[Meteor.userId()] !== undefined)
			usersId.push(Meteor.userId());


		if(usersId[0] == undefined) return;

		var usersCol = Meteor.users.find({'$or': usersId}, {fields:
			{'services': 1}});


		usersCol = usersCol.fetch();

		var allOrder = {};
				allOrder.totaldiscount = 0;
			allOrder.totalToPay = 0;


		var users = usersCol.map(function( user ) {
			var text = '			Your order is:\n';
			var total = 0;
			menuOrdered[user._id].forEach(function( order ) {
				var cat = order.category;
				var name = order.itemName;
				var count = order.count;
				var price = menu[cat][name][0];

				if(allOrder[cat] === undefined)
					allOrder[cat] = {};
				if(allOrder[cat][name] === undefined)
					allOrder[cat][name] = {'count': 0, 'price': price, 'total': 0};

					text += cat + ' - '+ name +' - ' + count + '\n';
					total += count * price;

					allOrder[cat][name].count += count;
					allOrder[cat][name].total += count * price;
			});

			allOrder.totaldiscount += +discount[user._id];
			allOrder.totalToPay += total - +discount[user._id];


			text += 'discount = ' + discount[user._id].toFixed(2) + ' $\n';
			total -= + discount[user._id];
			text += 'Total to pay = ' + total.toFixed(2) + ' $\n';


			return {
				'email': user.services.google.email,
				'_id': user._id,
				'subject': 'Your pizza order',
				'text': text,
				'total': total
			};
		});

		var textAllOrder = '\n			List of items to order in restaurant:\n';

		for(let order in allOrder) {
			for(let item in allOrder[order]) {
				let c = allOrder[order][item].count;
				let p = allOrder[order][item].total;
				textAllOrder += order +' - '+ item +' - '+ c + ' = ' + p.toFixed(2) + ' $\n';
			}
		}
		textAllOrder+= 'Total discount = ' + allOrder.totaldiscount.toFixed(2) + ' $\n';
		textAllOrder+= 'Total to pay = ' + allOrder.totalToPay.toFixed(2) + ' $\n';

		users.forEach(function( user ) {
			sendEmailto(user.email, hostEmail, user.subject, user.text, textAllOrder);
		});

		function sendEmailto( to, from, subject, text, textAllOrder ) {
			var hostEm = from;
			var text = text;
			if(to == hostEm.replace('%40', '@')) {
				text = text + textAllOrder;
			}
			_this.unblock();
			Email.send({
				to: to,
				from: from,
				subject: subject,
				text: text
			});
		}

	},
});






