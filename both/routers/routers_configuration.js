Router.configure({
	layoutTemplate: 'Layout',
	yieldTemplates: {
		'Header': {'to': 'header'},
		'Footer': {'to': 'footer'}
	},
	notFoundTemplate: 'notFound',
	loadingTemplate: 'Spinner'
});