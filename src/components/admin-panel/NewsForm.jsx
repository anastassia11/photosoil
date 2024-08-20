'use client'

import { useEffect, useState } from 'react'
import { BASE_SERVER_URL } from '@/utils/constants';
import DragAndDrop from './ui-kit/DragAndDrop';
import { Oval } from 'react-loader-spinner';
import { sendPhoto } from '@/api/photo/send_photo';
import * as Tabs from "@radix-ui/react-tabs";
import TextEditor from './TextEditor';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import { useDispatch, useSelector } from 'react-redux';
import { deletePhotoById } from '@/api/photo/delete_photo';
import Filter from '../soils/Filter';
import { getTags } from '@/api/tags/get_tags';
import Textarea from './ui-kit/Textarea';
import PhotoCard from './ui-kit/PhotoCard';
import FileCard from './ui-kit/FileCard';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';

export default function NewsForm({ _news, pathname, onNewsSubmit, isLoading, btnText, oldTwoLang, oldIsEng }) {
    const dispatch = useDispatch();
    const [news, setNews] = useState({});
    const [newsPhotos, setNewsPhotos] = useState([]);
    const [files, setFiles] = useState([]);
    const [tags, setTags] = useState([]);

    const [isEng, setIsEng] = useState(false);
    const [createTwoLang, setCreateTwoLang] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

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
        fetchTags();
    }, [])

    const fetchTags = async () => {
        const result = await getTags();
        if (result.success) {
            setTags(result.data);
        }
    }

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
        setFiles(prev => [...prev, { isLoading: true, name: file.name }]);
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
        const hasRequiredFields = () => {
            if (createTwoLang) {
                return news.translations?.some(({ isEnglish, title }) => (
                    (isEnglish && title.length > 0) || (!isEnglish && title.length > 0)
                ));
            } else {
                return news.translations?.some(({ isEnglish, title }) => (
                    (isEng && isEnglish && title.length > 0) || (!isEng && !isEnglish && title.length > 0)
                ));
            }
        };

        if (hasRequiredFields()) {
            onNewsSubmit({ createTwoLang, isEng, news, newsPhotos });
        } else {
            dispatch(openAlert({ title: t('warning'), message: t('form_required'), type: 'warning' }))
        }
    };

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col w-full h-fit pb-16">
            <div className='flex flex-col w-full h-full'>
                <Tabs.Root defaultValue={false} className="pt-2 md:col-span-2 sticky top-0 z-40  bg-[#f6f7f9]" value={isEng}
                    onValueChange={handleLangChange}>
                    <Tabs.List className="w-full border-b flex md:items-center gap-x-4 overflow-x-auto justify-between md:flex-row flex-col">
                        <div className='flex items-center gap-x-4 overflow-x-auto md:order-1 order-2'>
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
                        {(!oldTwoLang || pathname !== 'edit') && <label htmlFor='createTwoLang' className={`md:order-2 order-1 pb-4  md:pb-2.5 flex flex-row cursor-pointer items-center`}>
                            <input type="checkbox" id='createTwoLang'
                                checked={createTwoLang}
                                onChange={handleTwoLangChange}
                                className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                            <span>{pathname === 'edit' ? `${oldIsEng ? t('add_ru') : t('add_en')}` : t('create_two_lang')}</span>
                        </label>}
                    </Tabs.List>
                </Tabs.Root>
                <div className='flex flex-col w-full mt-4'>
                    <Textarea name='title'
                        label={<>
                            {`${t('heading')} ${isEng ? '(EN)' : ''}`}<span className='text-orange-600'>*</span>
                        </>}
                        value={news.translations?.find(({ isEnglish }) => isEng === isEnglish)?.title || ''}
                        onChange={handleInputChange}
                        required={true} />
                    {/* {Textarea({
                            name: 'title',
                            label: <>
                                {`${t('heading')} ${isEng ? '(EN)' : ''}`}<span className='text-orange-600'>*</span>
                            </>,
                            value: news.translations?.find(({ isEnglish }) => isEng === isEnglish)?.title || '',
                            onChange: handleInputChange,
                            required: true
                        })} */}
                </div>
                <div className='flex flex-col w-full mt-4'>
                    {Textarea({
                        name: 'annotation',
                        label: `${t('annotation')} ${isEng ? '(EN)' : ''}`,
                        value: news.translations?.find(({ isEnglish }) => isEng === isEnglish)?.annotation || '',
                        onChange: handleInputChange,
                        required: false
                    })}
                </div>
                <div className='mt-4 flex flex-col'>
                    <label className="font-medium min-h-fit">
                        {`${t('news_text')} ${isEng ? '(EN)' : ''}`}
                    </label>
                    <div className={`w-full relative ${isEng ? 'hidden' : 'block'}`}>
                        <TextEditor content={news.translations?.find(({ isEnglish }) => !isEnglish)?.content || ''}
                            setContent={html => setNews(prevNews => ({
                                ...prevNews, translations: prevNews.translations?.map(translation =>
                                    (!translation.isEnglish) ? { ...translation, content: html } : translation)
                            }))} />
                    </div>
                    <div className={`w-full relative ${isEng ? 'block' : 'hidden'}`}>
                        <TextEditor content={news.translations?.find(({ isEnglish }) => isEnglish)?.content || ''}
                            setContent={html => setNews(prevNews => ({
                                ...prevNews, translations: prevNews.translations?.map(translation =>
                                    (translation.isEnglish) ? { ...translation, content: html } : translation)
                            }))} />
                    </div>
                </div>

                <div className='mt-6 flex flex-col'>
                    <label className="font-medium min-h-fit">
                        {`${t('gallery')}`}
                    </label>
                    {!newsPhotos?.length ?
                        <div className='w-full md:w-1/2 h-[150px] pr-2 mt-1'>
                            <DragAndDrop onLoadClick={handleNewsPhotoSend} isMultiple={true} accept='img' />
                        </div>
                        :
                        <ul className={`grid md:grid-cols-2 grid-cols-1 gap-4 `}>
                            {newsPhotos.map(photo => <li key={photo.id}>
                                <PhotoCard {...photo} isEng={isEng} onDelete={handleNewsPhotoDelete}
                                    onChange={handleNewsPhotosChange} />
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
                        <div className='w-full md:w-1/2 h-[150px] pr-2 mt-1'>
                            <DragAndDrop onLoadClick={handleFilesSend} isMultiple={true} accept='pdf' />
                        </div>
                        :
                        <ul className={`mt-1 flex flex-col w-full md:w-1/2`}>
                            {files.map(file => <li key={file.id}>
                                {FileCard({ ...file, onDelete: () => handleFileDelete(file.id) })}
                            </li>)}
                            <div className='mt-2 h-[150px] w-full'>
                                <DragAndDrop onLoadClick={handleFilesSend} isMultiple={true} accept='pdf' />
                            </div>
                        </ul>}
                </div>

                <div className='mt-8 flex flex-col w-full md:w-1/2'>
                    <Filter name={t('tags')} items={tags} setTags={setTags}
                        isEng={isEng} type='news-tags'
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
                className="min-w-[232px] mt-16 min-h-[40px] flex items-center justify-center self-end w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
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
