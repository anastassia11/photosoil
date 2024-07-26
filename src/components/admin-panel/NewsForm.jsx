'use client'

import { useEffect, useState } from 'react'
import { BASE_SERVER_URL } from '@/utils/constants';
import DragAndDrop from './ui-kit/DragAndDrop';
import { Oval } from 'react-loader-spinner';
import { sendPhoto } from '@/api/photo/send_photo';
import * as Tabs from "@radix-ui/react-tabs";
import { useTranslation } from 'react-i18next';
import TextEditor from './TextEditor';
import Image from 'next/image';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import { useDispatch, useSelector } from 'react-redux';
import { deletePhotoById } from '@/api/photo/delete_photo';
import Filter from '../soils/Filter';
import { getTags } from '@/api/tags/get_tags';
import { getAllTags } from '@/store/slices/dataSlice';

export default function NewsForm({ _news, pathname, onNewsSubmit, isLoading, btnText, oldTwoLang, oldIsEng }) {
    const dispatch = useDispatch();
    const [news, setNews] = useState({});
    const [newsPhotos, setNewsPhotos] = useState([]);
    const [files, setFiles] = useState([]);
    const tags = useSelector(state => state.data.tags);
    const [isEng, setIsEng] = useState(false);
    const [createTwoLang, setCreateTwoLang] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (_news) {
            setNews({
                ..._news, objectPhoto: _news.objectPhoto?.map(({ id }) => id),
                files: _news.files?.map(({ id }) => id),
                tags: _news.tags?.map(({ id }) => id),
            });
            setIsEng(oldIsEng);
            _news.objectPhoto && setNewsPhotos(_news.objectPhoto);
            _news.files && setFiles(_news.files);
            setCreateTwoLang(_news.translations?.length > 1);
        } else {
            setNews({ translations: [{ isEnglish: false }] });
        }
    }, [_news])

    useEffect(() => {
        dispatch(getAllTags());
    }, [])

    const handleInputChange = (e) => {
        const { value, name } = e.target;
        setNews(prevNews => ({
            ...prevNews, translations: prevNews.translations.map(translation =>
                translation.isEnglish === isEng ? { ...translation, [name]: value } : translation)
        }));
    }

    const handleFileDelete = async (id) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_file'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await deleteFile(id);
        }
        dispatch(closeModal());
    }

    const deleteFile = async (id) => {
        let result;
        if (pathname !== 'edit') {
            result = await deletePhotoById(id);
        }
        if (pathname === 'edit' || result.success) {
            setFiles(prevFiles => {
                const _prevFiles = prevFiles.filter(el => el.id !== id);
                setNews(prevNews => ({
                    ...prevNews, files: _prevFiles.map(({ id }) => id)
                }));
                return _prevFiles;
            });
        }
    }

    const handleTwoLangChange = (e) => {
        if (pathname === 'edit') {
            if (e.target.checked) {
                if (news.translations?.length < 2) {
                    setNews(prevNews => ({ ...prevNews, translations: [...prevNews.translations, { isEnglish: !isEng }] }))
                }
            } else {
                setIsEng(oldIsEng);
            }
        } else {
            if (news.translations?.length < 2) {
                setNews(prevNews => ({ ...prevNews, translations: [...prevNews.translations, { isEnglish: !isEng }] }));
            }
        }
        setCreateTwoLang(e.target.checked);
    }

    const handleLangChange = (value) => {
        setIsEng(value);
    }

    const handleNewsPhotoSend = async (file, index) => {
        setNewsPhotos(prev => [...prev, { isLoading: true }]);
        const result = await sendPhoto(file);
        if (result.success) {
            setNewsPhotos(prevPhotos => {
                const _prevPhotos = prevPhotos.map((photo, idx) =>
                    idx === index + newsPhotos.length
                        ? { ...photo, ...result.data, isLoading: false }
                        : photo
                );
                setNews(prevNews => ({ ...prevNews, objectPhoto: _prevPhotos.map(({ id }) => id) }));
                return _prevPhotos;
            });
        }
    }

    const newsPhotoDelete = async (id) => {
        let result;
        if (pathname !== 'edit') {
            result = await deletePhotoById(id)
        }
        if (pathname === 'edit' || result.success) {
            setNewsPhotos(prevPhotos => {
                const _prevPhotos = prevPhotos.filter(el => el.id !== id);
                setNews(prevNews => ({ ...prevNews, objectPhoto: _prevPhotos.map(({ id }) => id) }))
                return _prevPhotos;
            });
        }
    }

    const handleNewsPhotoDelete = async (id) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_photo'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await newsPhotoDelete(id);
        }
        dispatch(closeModal());
    }

    const handleNewsPhotosChange = (e, id) => {
        setNewsPhotos(prev => prev.map(item =>
            item.id === id
                ? { ...item, [isEng ? 'titleEng' : 'titleRu']: e.target.value }
                : item
        ));
    }

    const handleFilesSend = async (file, index) => {
        setFiles(prev => [...prev, { isLoading: true }]);
        const result = await sendPhoto(file);
        if (result.success) {
            setFiles(prevFiles => {
                const _prevFiles = prevFiles.map((file, idx) =>
                    idx === index + files.length
                        ? { ...file, ...result.data, isLoading: false }
                        : file
                );
                setNews(prevNews => ({ ...prevNews, files: _prevFiles.map(({ id }) => id) }))
                return _prevFiles;
            });
        }
    }

    const handleContentChange = (html) => {
        setNews(prevNews => ({
            ...prevNews, translations: prevNews.translations?.map(translation =>
                translation.isEnglish === isEng ? { ...translation, content: html } : translation)
        }));
    }

    const handleAddTag = (newItem) => {
        setNews(prevNews => ({ ...prevNews, tags: prevNews.tags ? [...prevNews.tags, newItem] : [newItem] }));
    }

    const handleDeleteTag = (deletedItem) => {
        setNews(prevNews => ({ ...prevNews, tags: prevNews.tags.filter(id => id !== deletedItem) }));
    }

    const handleResetTag = () => {
        setNews(prevNews => ({ ...prevNews, tags: [] }));
    }

    const handleFormSubmit = () => {
        onNewsSubmit({ createTwoLang, isEng, news, newsPhotos });
    }

    const Textarea = ({ name, label }) => {
        return <div className='min-h-full flex flex-col pb-1.5'>
            <label className="font-medium min-h-fit">
                {`${label} ${isEng ? '(EN)' : ''}`}<span className='text-orange-600'>*</span>
            </label>
            <textarea
                required={name === 'heading'}
                value={news.translations?.find(({ isEnglish }) => isEng === isEnglish)?.[name] || ''}
                name={name}
                onChange={handleInputChange}
                type="text"
                className="scroll bg-white w-full h-full flex-1 mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    }

    const FileCard = ({ id, name, fileName, path, onDelete, isLoading }) => {
        const fileTitle = <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-4 0 40 40"
                className='w-5 h-5 mr-1' >
                <path
                    fill="#EB5757"
                    d="M25.669 26.096c-.488.144-1.203.16-1.97.049a9.392 9.392 0 0 1-2.49-.742c1.473-.214 2.615-.148 3.591.198.232.082.612.301.869.495Zm-8.214-1.35-.177.048c-.396.108-.782.213-1.153.306l-.501.127c-1.008.255-2.038.516-3.055.826.387-.932.746-1.875 1.098-2.797.26-.682.526-1.379.801-2.067.14.23.285.461.437.692a13.483 13.483 0 0 0 2.55 2.865Zm-2.562-10.513c.065 1.15-.183 2.257-.547 3.318-.449-1.312-.658-2.762-.097-3.932.144-.3.261-.46.338-.545.118.183.273.59.306 1.159Zm-5.26 14.572c-.252.451-.509.873-.772 1.272-.637.958-1.677 1.985-2.212 1.985-.052 0-.116-.008-.209-.107-.06-.062-.07-.107-.066-.169.018-.352.485-.98 1.161-1.562a11.44 11.44 0 0 1 2.098-1.419Zm17.738-2.659c-.082-1.174-2.059-1.927-2.078-1.934-.764-.271-1.594-.403-2.538-.403-1.01 0-2.098.146-3.497.473a12.17 12.17 0 0 1-3.122-3.209c-.354-.54-.673-1.079-.951-1.605.678-1.623 1.29-3.367 1.178-5.32-.09-1.566-.796-2.618-1.756-2.618-.659 0-1.226.488-1.688 1.451-.822 1.718-.606 3.915.643 6.537a91.473 91.473 0 0 0-1.272 3.213c-.504 1.319-1.023 2.68-1.607 3.973-1.64.65-2.987 1.436-4.109 2.402-.735.631-1.622 1.597-1.672 2.605-.025.474.138.91.468 1.258.352.37.793.566 1.279.566 1.603 0 3.146-2.202 3.439-2.644.589-.888 1.14-1.879 1.68-3.021 1.361-.492 2.811-.859 4.217-1.214l.503-.128a67.63 67.63 0 0 0 1.175-.313c.427-.115.867-.235 1.313-.349 1.443.918 2.995 1.517 4.51 1.737 1.274.185 2.406.078 3.173-.322.69-.36.728-.913.712-1.135Zm3.105 10.097c0 2.15-1.896 2.283-2.278 2.287H3.745c-2.143 0-2.272-1.908-2.276-2.287V3.756c0-2.152 1.899-2.283 2.276-2.287h16.518l.009.009v6.446c0 1.294.782 3.743 3.744 3.743h6.404l.055.055v24.52Zm-1.519-26.045h-4.94c-2.142 0-2.272-1.898-2.275-2.274v-4.97l7.215 7.244Zm2.988 26.045V11.116L21.742.87V.823h-.048L20.874 0H3.744C2.45 0 0 .785 0 3.757v32.486C0 37.543.783 40 3.745 40H28.2c1.295 0 3.745-.786 3.745-3.757Z" />
            </svg>
            {name || fileName}
        </>
        return <div className='flex flex-row max-w-full space-x-3'>
            {path ? <a className='flex flex-row text-blue-700 hover:underline cursor-pointer transition-all duration-300'
                href={`${BASE_SERVER_URL}${path}`}>
                {fileTitle}
            </a> : <p className={`flex flex-row duration-300 `}>
                {fileTitle}
            </p>}
            <button className='text-zinc-500 hover:text-zinc-800 duration-300 pt-[1px]'
                onClick={() => onDelete(id)}>
                <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                    <g id="Menu / Close_LG">
                        <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                </svg>
            </button>
        </div>
    }

    const PhotoCard = ({ id, path, titleEng, titleRu, fileName, onDelete, isLoading }) => {
        return <div className='flex flex-row space-x-4 h-[150px] mt-1'>
            <div className='bg-black/10 relative flex flex-col justify-center items-center min-w-[150px] aspect-[1/1] rounded-md overflow-hidden
                            shadow-lg'>
                {isLoading ? <Oval
                    height={30}
                    width={30}
                    color="#FFFFFF"
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#FFFFFF"
                    strokeWidth={4}
                    strokeWidthSecondary={4} />
                    : <Image src={`${BASE_SERVER_URL}${path}`} height={150} width={150} alt={id}
                        className='object-cover w-[150px] aspect-[1/1]' />}
                {!isLoading && <p className='overflow-hidden whitespace-nowrap overflow-ellipsis py-1 px-2 text-sm font-medium z-10 absolute bottom-0 backdrop-blur-md bg-black bg-opacity-40 text-white w-full'>
                    {fileName}
                </p>}
                {!isLoading && <button className='overflow-hidden p-[6px] text-sm font-medium z-10 absolute top-0 right-0 rounded-bl-md
                                backdrop-blur-md bg-black bg-opacity-40 text-zinc-200 hover:text-white duration-300'
                    onClick={() => onDelete(id)}>
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-4 h-4'>
                        <g id="Menu / Close_LG">
                            <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                </button>}
            </div>

            <div className='w-full flex flex-col justify-between'>
                <textarea
                    value={isEng ? (titleEng || '') : (titleRu || '')}
                    onChange={e => {
                        handleNewsPhotosChange(e, id)
                    }}
                    type="text"
                    placeholder={`Текст к фото ${isEng ? '(EN)' : ''}`}
                    className="bg-white w-full p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md max-h-full"
                />
            </div>
        </div>
    }

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col w-full h-fit">
            <div className='flex flex-col w-full h-full'>

                <Tabs.Root defaultValue={false} className="col-span-2" value={isEng}
                    onValueChange={handleLangChange}>
                    <Tabs.List className="w-full border-b flex items-center gap-x-4 overflow-x-auto justify-between">
                        <div className='flex items-center gap-x-4 overflow-x-auto'>
                            <Tabs.Trigger disabled={!createTwoLang && isEng}
                                className="disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                                value={false}>
                                <div className="pb-2.5 px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium">
                                    Русскоязычная версия
                                </div>
                            </Tabs.Trigger>
                            <Tabs.Trigger disabled={!createTwoLang}
                                className="disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                                value={true}>
                                <div className="pb-2.5 px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium">
                                    English version
                                </div>
                            </Tabs.Trigger>
                        </div>
                        {(!oldTwoLang || pathname !== 'edit') && <label htmlFor='createTwoLang' className={`pb-2.5 flex flex-row cursor-pointer items-center`}>
                            <input type="checkbox" id='createTwoLang'
                                checked={createTwoLang}
                                onChange={handleTwoLangChange}
                                className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                            <span>{pathname === 'edit' ? `${oldIsEng ? t('add_ru') : t('add_en')}` : t('create_two_lang')}</span>
                        </label>}
                    </Tabs.List>
                </Tabs.Root>

                <div className='flex flex-row space-x-4 mt-4'>
                    <div className='flex flex-col w-full min-h-[100px]'>
                        {Textarea({ name: 'title', label: t('heading') })}
                    </div>

                    {/* <div className='flex flex-col w-full mb-1.5 min-h-[150px] max-h-[250px]'>
                        <p className='font-medium mb-1'>Обложка</p>
                        {cover?.path ? PhotoCard({ ...cover, onDelete: handleCoverDelete })
                            : <DragAndDrop onLoadClick={handleCoverSend} isMultiple={false} accept='img' />}
                    </div> */}
                </div>
                {/* <div className='flex flex-col w-full min-h-[150px] mt-4'>
                    {Textarea({ name: 'annotation', label: t('annotation') })}
                </div> */}
                <div className='mt-4 flex flex-col'>
                    <label className="font-medium min-h-fit">
                        {`${t('news_text')} ${isEng ? '(EN)' : ''}`}
                    </label>
                    <div className='w-full relative'>
                        <TextEditor content={news.translations?.find(({ isEnglish }) => isEng === isEnglish)?.content || ''}
                            setContent={handleContentChange} />
                    </div>
                </div>

                <div className='mt-6 flex flex-col'>
                    <label className="font-medium min-h-fit">
                        {`${t('gallery')}`}
                    </label>
                    {!newsPhotos?.length ?
                        <div className='w-1/2 h-[150px] pr-2 mt-1'>
                            <DragAndDrop onLoadClick={handleNewsPhotoSend} isMultiple={true} accept='img' />
                        </div>
                        :
                        <ul className={` grid grid-cols-2 gap-4 `}>
                            {newsPhotos.map(photo => <li key={photo.id}>
                                {PhotoCard({ ...photo, onDelete: handleNewsPhotoDelete })}
                            </li>)}
                            <div className='h-[150px]'>
                                <DragAndDrop onLoadClick={handleNewsPhotoSend} isMultiple={true} accept='img' />
                            </div>
                        </ul>}
                </div>

                <div className='mt-8 flex flex-col'>
                    <label className="font-medium min-h-fit">
                        {`${t('files')}`}
                    </label>
                    {!files?.length ?
                        <div className='w-1/2 h-[150px] pr-2 mt-1'>
                            <DragAndDrop onLoadClick={handleFilesSend} isMultiple={true} accept='pdf' />
                        </div>
                        :
                        <ul className={`mt-1 flex flex-col`}>
                            {files.map(file => <li key={file.id}>
                                {FileCard({ ...file, onDelete: handleFileDelete })}
                            </li>)}
                            <div className='mt-2 h-[150px] w-1/2'>
                                <DragAndDrop onLoadClick={handleFilesSend} isMultiple={true} accept='pdf' />
                            </div>
                        </ul>}
                </div>

                <div className='mt-8 flex flex-col w-1/2'>
                    <Filter name={t('tags')} items={tags} isEng={isEng}
                        allSelectedItems={news?.tags}
                        addItem={newItem => handleAddTag(newItem)}
                        deleteItem={deletedItem => handleDeleteTag(deletedItem)}
                        resetItems={deletedItems => handleResetTag(deletedItems)}
                    />
                </div>
            </div>

            <button
                onClick={handleFormSubmit}
                disabled={isLoading}
                className="min-w-[232px] mt-8 min-h-[40px] flex items-center justify-center self-end w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 disabled:bg-blue-600/70 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 align-bottom">
                {isLoading ?
                    <Oval
                        height={20}
                        width={20}
                        color="#FFFFFF"
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#FFFFFF"
                        strokeWidth={4}
                        strokeWidthSecondary={4} />
                    : btnText}
            </button>
        </form >
    )
}
