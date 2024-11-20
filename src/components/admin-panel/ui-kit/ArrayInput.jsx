import { getTranslation } from '@/i18n/client';
import { useParams } from 'next/navigation';

export default function ArrayInput({ title, name, fields, onRemove, onAppend, register, subName, isEng, required }, ref) {
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    return (
        <div className='flex flex-col w-full '>
            <p className="font-medium">
                {title ? <label className="font-medium flex flex-row">
                    {title}{isEng ? ' (EN) ' : ''}<span className='text-orange-500'>{required ? '*' : ''}</span>
                </label> : ''}
            </p>
            <ul>
                {fields.map((field, index) => <li className='flex flex-row items-center mb-1' key={`${name}_${field.id}`}>
                    <p className='w-[40px] pt-1'>{index + 1}.</p>
                    <input
                        ref={ref}
                        {...register(`${name}.${index}${subName ? `.${subName}` : ''}`)}
                        type="text"
                        className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                    />
                    <button type='button'
                        className='p-2'
                        onClick={() => onRemove(index)}>
                        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                            <g id="Menu / Close_LG">
                                <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                        </svg>
                    </button>
                </li>
                )}
            </ul>
            <button type='button' className='font-medium text-blue-600 w-fit'
                onClick={() => onAppend('')}>
                <span className='text-2xl pr-2'>+</span>
                {t('add')}
            </button>
        </div>
    )
}
