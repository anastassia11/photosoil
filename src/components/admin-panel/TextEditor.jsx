'use client'

import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setDropdown } from '@/store/slices/generalSlice'

import * as Icons from './TextEditor/Icons'
import Dropdown from './ui-kit/Dropdown'
import '@/styles/editor.css'

const TextEditor = memo(
	function TextEditor({ content, setContent, isSoil, type }) {
		const dispatch = useDispatch()
		const linkRef = useRef(null)
		const [url, setUrl] = useState('')
		const [isFocusing, setIsFocusing] = useState(false)
		const contentInserting = useRef(false)
		const dropdown = useSelector(state => state.general.dropdown)
		const HEADING = {
			0: 'Paragraph',
			// 1: 'Heading 1',
			2: 'Heading 2',
			3: 'Heading 3'
		}

		const editor = useEditor({
			extensions: [
				StarterKit.configure({
					bold: true,
					italic: true,
					strike: false,
					heading: {
						levels: isSoil ? [] : [2, 3]
					},
					bulletList: {
						keepMarks: isSoil ? false : true,
						keepAttributes: false
					},
					orderedList: {
						keepMarks: isSoil ? false : true,
						keepAttributes: false
					},
					codeBlock: false,
					hardBreak: false,
					horizontalRule: false,
					listItem: true,
					paragraph: true,
					text: true,
					underline: true
				}),
				Link.configure({
					openOnClick: false
				}),
				Underline
			],
			editorProps: {
				attributes: {
					class: 'focus:outline-none'
				},
				transformPastedHTML: html => {
					return html
						.replace(/style="[^"]*"/g, '')
						.replace(/class="[^"]*"/g, '')
				}
			},
			immediatelyRender: false,
			onUpdate: ({ editor }) => {
				const html = editor.getHTML()
				if (html !== content) {
					setContent(html)
				}
			}
		})

		useEffect(() => {
			if (!contentInserting.current) {
				contentInserting.current = true
				insertHtmlContent(content)
				contentInserting.current = false
			}
		}, [content, editor])

		useEffect(() => {
			editor?.on('focus', () => {
				setIsFocusing(true)
			})
			editor?.on('blur', () => {
				setIsFocusing(false)
			})
		}, [editor])

		useEffect(() => {
			let timeoutId
			if (dropdown.key === `linkModal-${type}` && dropdown.isActive) {
				timeoutId = setTimeout(() => {
					linkRef.current.focus()
				}, 100)
			}
			return () => {
				clearTimeout(timeoutId)
			}
		}, [dropdown])

		const insertHtmlContent = htmlContent => {
			if (editor && htmlContent !== editor.getHTML()) {
				editor.commands.setContent(htmlContent)
			}
		}

		const openModal = e => {
			e.stopPropagation()
			if (dropdown.key === `linkModal-${type}` && dropdown.isActive) {
				dispatch(setDropdown({ key: null, isActive: false }))
				setUrl('')
			} else {
				setUrl(editor.getAttributes('link').href)
				dispatch(setDropdown({ key: `linkModal-${type}`, isActive: true }))
			}
		}

		const closeModal = useCallback(() => {
			dispatch(setDropdown({ key: null, isActive: false }))
			setUrl('')
		}, [])

		const saveLink = useCallback(() => {
			if (url) {
				editor
					.chain()
					.focus()
					.extendMarkRange('link')
					.setLink({ href: url, target: '_blank' })
					.run()
			} else {
				editor.chain().focus().extendMarkRange('link').unsetLink().run()
			}
			closeModal()
		}, [editor, url, closeModal])

		const removeLink = useCallback(() => {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()
			closeModal()
		}, [editor, closeModal])

		const handleHeadingChange = level => {
			level != 0
				? editor
						.chain()
						.focus()
						.toggleHeading({ level: Number(level) })
						.run()
				: editor.chain().focus().setParagraph().run()
		}

		if (!editor) {
			return null
		}

		return (
			<div
				className={`cursor-text ${isSoil ? '' : 'min-h-[300px]'} editor mt-1 p-2 bg-white border rounded-md focus:border-blue-600 ${isFocusing ? 'border-blue-600' : ''}`}
				onClick={e => {
					e.stopPropagation()
					editor.chain().focus()
				}}
			>
				<div className='flex flex-row flex-wrap space-x-4 border-b pb-2 mb-2'>
					<BubbleMenu
						className={`${dropdown.key === `linkModal-${type}` ? 'invisible opacity-0' : 'visible'} flex duration-300 rounded-md border border-gray-200 bg-white p-2 flex-row z-40 space-x-2 items-center`}
						tippyOptions={{ duration: 150 }}
						editor={editor}
						shouldShow={({ editor, view, state, oldState, from, to }) => {
							return from === to && editor.isActive('link')
						}}
					>
						<a
							href={editor.getAttributes('link').href}
							className='max-w-full text-nowrap text-ellipsis overflow-hidden text-blue-600 underline underline-offset-2 duration-300'
						>
							{editor.getAttributes('link').href}
						</a>

						<button
							type='button'
							className={`${editor.isActive('link') ? 'block' : 'hidden'}
              linkModal text-gray-600 p-2 hover:bg-gray-100 rounded-md duration-300`}
							onClick={openModal}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.5}
								stroke='currentColor'
								className='size-5'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125'
								/>
							</svg>
						</button>

						<button
							type='button'
							className={`${editor.isActive('link') ? 'block' : 'hidden'}
            text-red-600 p-2 hover:bg-red-100 rounded-md duration-300`}
							onClick={removeLink}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.5}
								stroke='currentColor'
								className='size-5'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
								/>
							</svg>
						</button>
					</BubbleMenu>

					{!isSoil ? (
						<div className='w-[155px]'>
							<Dropdown
								flexRow={true}
								noBold={true}
								value={
									editor?.isActive('heading', { level: 1 })
										? '1'
										: editor?.isActive('heading', { level: 2 })
											? '2'
											: editor?.isActive('heading', { level: 3 })
												? '3'
												: '0'
								}
								items={HEADING}
								dropdownKey='heading'
								onCategotyChange={handleHeadingChange}
							/>
						</div>
					) : (
						''
					)}

					<div className='flex flex-row'>
						<button
							type='button'
							className={`${editor.isActive('bold') ? 'text-blue-600' : 'text-gray-700'} border border-transparent p-2
          rounded-md hover:text-blue-600 duration-300`}
							onClick={() => editor.chain().focus().toggleBold().run()}
							disabled={!editor.can().chain().focus().toggleBold().run()}
						>
							<Icons.Bold strokeWidth={editor.isActive('bold') ? '2.5' : '2'} />
						</button>

						<button
							type='button'
							className={`${editor.isActive('italic') ? 'text-blue-600' : 'text-gray-700'} relative cursor-pointer border border-transparent p-2
          rounded-md hover:text-blue-600 duration-300`}
							onClick={() => editor.chain().focus().toggleItalic().run()}
							disabled={!editor.can().chain().focus().toggleItalic().run()}
						>
							<Icons.Italic
								strokeWidth={editor.isActive('italic') ? '2.5' : '2'}
							/>
						</button>

						<button
							type='button'
							className={`${editor.isActive('underline') ? 'text-blue-600' : 'text-gray-700'} border border-transparent p-2
          rounded-md hover:text-blue-600 duration-300`}
							onClick={() => editor.chain().focus().toggleUnderline().run()}
							disabled={!editor.can().chain().focus().toggleUnderline().run()}
						>
							<Icons.Underline
								strokeWidth={editor.isActive('underline') ? '2.5' : '2'}
							/>
						</button>
					</div>

					<div className='flex flex-row'>
						<button
							type='button'
							className={`${editor.isActive('bulletList') ? 'text-blue-600' : 'text-gray-700'} border border-transparent p-2
          rounded-md hover:text-blue-600 duration-300`}
							onClick={() => editor.chain().focus().toggleBulletList().run()}
						>
							<Icons.BulletList
								strokeWidth={editor.isActive('bulletList') ? '2' : '1.5'}
							/>
						</button>

						<button
							type='button'
							className={`${editor.isActive('orderedList') ? 'text-blue-600' : 'text-gray-700'} border border-transparent p-2
          rounded-md hover:text-blue-600 duration-300`}
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
						>
							<Icons.NumberedList
								strokeWidth={editor.isActive('orderedList') ? '2' : '1.5'}
							/>
						</button>
						{!isSoil ? (
							<button
								type='button'
								className={`${editor.isActive('blockquote') ? 'text-blue-600' : 'text-gray-700'} disabled:text-gray-400 disabled:cursor-default border border-transparent p-2
          rounded-md hover:text-blue-600 duration-300`}
								onClick={() => editor.chain().focus().toggleBlockquote().run()}
								disabled={
									!editor.can().chain().focus().toggleBlockquote().run()
								}
							>
								<Icons.Blockquote
									strokeWidth={editor.isActive('blockquote') ? '2' : '1.5'}
								/>
							</button>
						) : (
							''
						)}
					</div>

					<div
						className={`${editor.isActive('link') || (dropdown.key == `linkModal-${type}` && dropdown.isActive) ? 'text-blue-600' : 'text-gray-700'} linkModal cursor-pointer relative border border-transparent
          rounded-md hover:text-blue-600 duration-300 backface`}
						onClick={e => e.stopPropagation()}
					>
						<div
							onClick={openModal}
							className='linkModal h-full p-2 flex items-center justify-center'
						>
							<Icons.Link
								strokeWidth={
									dropdown.key === `linkModal-${type}` && dropdown.isActive
										? '2.5'
										: '2'
								}
							/>
						</div>
						<div
							className={`${dropdown.key == `linkModal-${type}` && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'} z-50 duration-200 
            sm:space-x-4 space-x-2
            transition-all absolute rounded-md border border-gray-200 bg-white p-2 pr-4 min-w-fit flex flex-row top-[20px] -left-[120px]`}
							onClick={e => e.stopPropagation()}
						>
							<input
								ref={linkRef}
								value={url}
								onChange={e => {
									e.stopPropagation()
									setUrl(e.target.value)
								}}
								placeholder='Enter URL'
								// name={name}
								type='text'
								className='h-[40px] bg-white min-w-[200px] p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md'
							/>
							<button
								type='button'
								className='text-blue-600 min-w-fit'
								onClick={saveLink}
							>
								Set Link
							</button>
						</div>
					</div>
				</div>

				<EditorContent
					editor={editor}
					className='pointer-events-auto z-40 p-2 focus:outline-none'
				/>
			</div>
		)
	},
	(prevProps, nextProps) => {
		return (
			prevProps.dropdown?.isActive === nextProps.dropdown?.isActive &&
			prevProps.dropdown?.key === nextProps.dropdown?.key &&
			prevProps.content === nextProps.content
		)
	}
)
export default TextEditor
