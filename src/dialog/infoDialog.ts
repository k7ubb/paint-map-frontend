'use strict';

import { getElementById } from 'utils';

const infoDialogElement = getElementById('info_dialog');
if (!(infoDialogElement instanceof HTMLDialogElement)) {
	throw new Error('Element \'info_dialog\' is not a dialog');
}

infoDialogElement.addEventListener('click', (e) => {
	if(!(e.target as HTMLElement).closest(('#info_dialog > div'))) {
		infoDialogElement.close();
	}
});

export const showInfoDialog = ({message, description, onClose}: {
	message: string;
	description?: string;
	onClose?: () => void;
}) => {
	getElementById('info_dialog_message').innerText = message;
	getElementById('info_dialog_description').innerText = description ?? '';
	getElementById('info_dialog_close_button').onclick = () => {
		onClose?.();
		infoDialogElement.close();
	};
	infoDialogElement.showModal();
};
