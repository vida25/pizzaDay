Template.menuItemsTmpl.onCreated(function() {
	Meteor.subscribe('groups');
	this.itemToModifyReact = new ReactiveVar(null);
	this.groupMenuReact = new ReactiveVar(null);
	this.curMenuItem = new ReactiveVar(null);
	this.menuCategoryReact = new ReactiveVar(null);
});
Template.menuItemsTmpl.onRendered(function() {

});

Template.menuItemsTmpl.onDestroyed(function() {

});

Template.menuItemsTmpl.helpers({

	'groups_you_access_menu': function() {
		var instance = Template.instance();
		var groups_ = Groups.find({});
			if(groups_ == undefined) return false;
		var groups = groups_.fetch();
		if(groups[0] !== undefined) {
			var groupsMenu = instance.groupMenuReact.get();
				if(groupsMenu === null)
				instance.groupMenuReact.set(groups[0].groupName);
		}
		if(groups[0] === undefined)
			return false;
		return groups_;
	},
	'menuItems': function() {
		var groupName = Template.instance().groupMenuReact.get();
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
								'description': menu[cat][i][1]
						})
					}
					menuArr.push(catR);
			}
		});
		return menuArr;
	},
	'itemToModify': function() {
		var _instance = Template.instance();
		var groupName = _instance.groupMenuReact.get();
		var item = _instance.itemToModifyReact.get();
		if(item == null || groupName == null) {
			return false;
		}
		var itemToMod = Groups.find({
			groupName: groupName
		},{fields: {menu: 1}}).fetch();
		var _root = item.split('.');

		if(_root.length == undefined || _root.length !== 2) {
			throw new Meteor.Error('happened wrong action!');
			return false;
		}
		var r =  itemToMod[0].menu[_root[0]][_root[1]];
		var obj = {
			category: _root[0],
			itemName: _root[1],
			price: r[0],
			description: r[1]
		};
		_instance.curMenuItem.set(obj);

		return obj;

	},
	'allowRemoveItem': function() {
		var found = Groups.findOne({
			groupName: Template.instance().groupMenuReact.get(),
			userId: Meteor.userId()
		},{fields: {groupName: 1}});
		if(found === undefined)
			return false;
		return true;
	},
	'menu_category': function() {
		var groupName = Template.instance().groupMenuReact.get();
		var curGroup = Groups.findOne({
			groupName: groupName
		},{fields: {menu: 1}});
		if(curGroup === undefined) return false;
			categories = [];

			for(var c in curGroup.menu) {
				categories.push(c);
			}

		if(categories === [])
			return false;
		return categories;

	}
});



Template.menuItemsTmpl.events({
	'change #select_menu_to_change': function(e, tmpl) {
		var _target = $(e.target);
		var selected = _target.children().filter('option:selected');
		var groupName = selected.text().trim();
		tmpl.itemToModifyReact.set(null);
		tmpl.curMenuItem.set(null);
		tmpl.groupMenuReact.set(groupName);
	},
	'click span[name=modify_item]': function(e, tmpl) {
		var _target = $(e.target);
		var _root = _target.parent().attr('name').trim();
		tmpl.itemToModifyReact.set(_root);
			$('#m_modify_menu').modal('show');
		// $('#').modal('show');
	},
	'click button#saveModified': function(e, tmpl) {
		var form = $('#modifiedMenuItem');
		var arr = form.serializeArray();
		var curItem = tmpl.curMenuItem.get();
		var groupName = tmpl.groupMenuReact.get();
		var _root = 'menu.'+curItem['category']+'.'
												+curItem['itemName'];

		var data = [arr[0]['value'], arr[1]['value']];

	Meteor.call('_upsert_menu_item', Meteor.userId(), groupName,_root, data);
	},
	'click span[name=removeItemFromMenu]': function(e, tmpl) {
		var _target = $(e.target);
		var groupName = tmpl.groupMenuReact.get();
		var allow = confirm('Are you sure you want to delete this menu item');
			if(!allow) return;

		var _root = 'menu.'+_target.parent()
																.prev()
																.attr('name')
																.trim();

		Meteor.call('_remove_menu_item', Meteor.userId(), groupName, _root);
	},
	'click  button[name=addCategory_modal]': function(e, tmpl) {
		$('#modal_add_new_category').modal('show');
	},
	'click button[name=addItems_modal]': function(e, tmpl) {
		$('#modal_add_menu_item').modal('show');
	},
	'input #input_category_name': function(e, tmpl) {
		var _target = $(e.target);
		var newCategory = _target.val();
		var saveButton = $('#modal_add_new_category button[name=save]');

		var allow = newCategory.search(/^((([a-zа-яієї][a-zа-я0-9іьєї\']{0,10}\s?){1,1}[a-zа-я0-9іьєї\']{1,10}[a-zа-яієьї]){1,1})$/ig);

		var groupName = tmpl.groupMenuReact.get();
		var data;
		var _root;
		if(allow !== 0) {
				_target.addClass('bg-danger');
				saveButton.addClass('disabled hidden');
				return;
		}
			found = Groups.findOne({
				groupName: groupName,
				[`menu.${newCategory}`]: undefined
			},{'fields': {groupName: 1}});

		if(found !== undefined) {
				_target.removeClass('bg-danger');
				saveButton.removeClass('disabled hidden');
				return;
			}
				_target.addClass('bg-danger');
				saveButton.addClass('disabled');

	},
	'click #modal_add_new_category button[name=save]': function(e, tmpl) {
		var groupName = tmpl.groupMenuReact.get();
		var name = $('#input_category_name').val().trim();
		var _root = 'menu.' + name;
		var data = {};
	Meteor.call('_upsert_menu_item',Meteor.userId(), groupName, _root, data);

	},
	'click #save_menu_item': function(e, tmpl) {
		var form = $('#new_item_config');
		var arr = form.serializeArray();
		var groupName = tmpl.groupMenuReact.get();

		var category = arr[0]['value'].trim();
		var itemName = arr[1]['value'].trim();
		var price = arr[2]['value'].trim();
		var description = arr[3]['value'].trim();

		var _root = 'menu.' + category +'.' + itemName;
		var d = [price, description];

		var l = arr.length;

		Meteor.call('_upsert_menu_item',Meteor.userId(), groupName, _root, d);
	},
	'input #new_item_config input[name=itemName]': function(e, tmpl) {
		var target = $(e.target);
		var value = target.val();
		var otherVal;
		var textareaVal;
		var saveButton = $('#save_menu_item');
		var allow = value.search(/^((([a-zа-яієї][a-zа-я0-9іьєї\']{0,10}\s?){1,1}[a-zа-я0-9іьєї\']{1,10}[a-zа-яієьї]){1,1})$/ig);

			if(allow !== 0) {
				target.addClass('bg-danger');
				saveButton.addClass('hidden');
				return;
			} else {
				target.removeClass('bg-danger');
			}

			otherVal = $('#new_item_config input[name=price]').val();
			allow = otherVal.search(/^([\d]{1,3}()[\.]?){0,1}([\d]?){0,2}$/);

			if(allow !== 0)
				return;

			textareaVal = $('#new_item_config textarea').val();
				allow = textareaVal.length;
			if(allow > 50 || allow < 5)
				return;

			 saveButton.removeClass('hidden');

	},
	'input #new_item_config input[name=price]': function(e, tmpl) {
		var target = $(e.target);
		var value = target.val();
		var otherVal;
		var textareaVal;
		var saveButton = $('#save_menu_item');
		var allow = value.search(/^([\d]{1,3}()[\.]?){0,1}([\d]?){0,2}$/);

			if(allow !== 0) {
				target.addClass('bg-danger');
				saveButton.addClass('hidden');
				return;
			} else {
				target.removeClass('bg-danger');
			}

			otherVal = $('#new_item_config input[name=itemName]').val();
				allow = otherVal.search(/^((([a-zа-яієї][a-zа-я0-9іьєї\']{0,10}\s?){1,1}[a-zа-я0-9іьєї\']{1,10}[a-zа-яієьї]){1,1})$/ig);

			if(allow !== 0)
				return;

			textareaVal = $('#new_item_config textarea').val();
				allow = textareaVal.length;
			if(allow > 50 || allow < 5)
				return;

			 saveButton.removeClass('hidden');

	},
	'input #new_item_config textarea': function(e, tmpl) {
		var target = $(e.target);
		var val = target.val();
		var inputs;
		var saveButton = $('#save_menu_item');
		var allow = val.length;

			if(allow > 50 || allow < 5) {
				target.addClass('bg-danger');
				saveButton.addClass('hidden');
				return;
			} else {
				target.removeClass('bg-danger');
			}

			var price = $('#new_item_config input[name=price]').val();
				allow = price.search(/^([\d]{1,3}()[\.]?){0,1}([\d]?){0,2}$/);

			if(allow !== 0)
				return;

			otherVal = $('#new_item_config input[name=itemName]').val();
				allow = otherVal.search(/^((([a-zа-яієї][a-zа-я0-9іьєї\']{0,10}\s?){1,1}[a-zа-я0-9іьєї\']{1,10}[a-zа-яієьї]){1,1})$/ig);

			if(allow !== 0)
				return;

				 saveButton.removeClass('hidden');

	},
});
