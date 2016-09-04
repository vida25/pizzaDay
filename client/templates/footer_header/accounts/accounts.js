/*Accounts.ui.config({
	requestPermissions: {},
	extraSignupFields: [{
		fieldName: 'first-name',
		fieldLabel: 'First name',
		inputType: 'text',
		visible: true,
		validate: function(value, errorFunction) {
			if (!value) {
				errorFunction("Please write your first name");
				return false;
			} else {
				return true;
			}
		}
	}, {
		fieldName: 'last-name',
		fieldLabel: 'Last name',
		inputType: 'text',
		visible: true,
	}, {
		fieldName: 'gender',
		showFieldLabel: false, // If true, fieldLabel will be shown before radio group
		fieldLabel: 'Gender',
		inputType: 'radio',
		radioLayout: 'vertical', // It can be 'inline' or 'vertical'
		data: [{ // Array of radio options, all properties are required
			id: 1, // id suffix of the radio element
			label: 'Man', // label for the radio element
			value: 'm',
			checked: 'checked' // value of the radio element, this will be saved.
		}, {
			id: 2,
			label: 'Woman',
			value: 'f'
		}],
		visible: true
	}, {
		fieldName: 'terms',
		fieldLabel: 'I accept the terms and conditions',
		inputType: 'checkbox',
		visible: true,
		saveToProfile: false,
		validate: function(value, errorFunction) {
			if (value) {
				return true;
			} else {
				errorFunction('You must accept the terms and conditions.');
				return false;
			}
		}
	}]
});
*/