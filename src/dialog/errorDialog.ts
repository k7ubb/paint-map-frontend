'use strict';

import { getElementById } from 'utils';

const errorDialogElement = getElementById('error_dialog');
if (!(errorDialogElement instanceof HTMLDialogElement)) {
	throw new Error('Element \'error_dialog\' is not a dialog');
}

errorDialogElement.addEventListener('click', (e) => {
	if(!(e.target as HTMLElement).closest(('#error_dialog > div'))) {
		errorDialogElement.close();
	}
});

export const showErrorDialog = ({message, description, onClose}: {
	message: string;
	description?: string;
	onClose?: () => void;
}) => {
	getElementById('error_dialog_message').innerText = message;
	getElementById('error_dialog_description').innerText = description ?? '';
	getElementById('error_dialog_close_button').onclick = () => {
		onClose?.();
		errorDialogElement.close();
	};
	errorDialogElement.showModal();
};
