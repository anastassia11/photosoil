import React from 'react'
import ReactModal from 'react-modal'

import * as Icons from './Icons'
import { Modal } from './Modal'

export function LinkModal(props) {
	const { url, closeModal, onChangeUrl, onSaveLink, onRemoveLink, ...rest } =
		props

	return (
		<Modal {...rest}>
			<h2 className='modal-title'>Edit link</h2>
			<button
				className='modal-close'
				type='button'
				onClick={closeModal}
			>
				<Icons.X />
			</button>
			<input
				className='modal-input'
				autoFocus
				value={url}
				onChange={onChangeUrl}
			/>
			<div className='modal-buttons'>
				<button
					className='button-remove'
					type='button'
					onClick={onRemoveLink}
				>
					Remove
				</button>
				<button
					className='button-save'
					type='button'
					onClick={onSaveLink}
				>
					Save
				</button>
			</div>
		</Modal>
	)
}
