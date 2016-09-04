Router.route('home', {
	'path': '/',
	'template': 'Home'
});

Router.route('pizza_day', {
	'path': 'pizza_day',
	'template': 'pizzaDay'
});

Router.onBeforeAction(function() {
	if(Meteor.userId() === null)
		this.redirect('home');
	this.next();
},{except: ['home']});
