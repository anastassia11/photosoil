import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Dropdown from '../admin-panel/ui-kit/Dropdown';

export default function LanguageChanger({ isTransparent, locale }) {
    const currentLocale = locale;
    const router = useRouter();
    const currentPathname = usePathname();

    const LANGUAGES = {
        ru: 'RU',
        en: 'EN'
    }

    const handleChange = (newLocale) => {
        router.push(
            currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
        );
        router.refresh();
    };

    return (
        <div className='sm:w-[80px] w-full h-full flex justify-center items-center -mt-1'>
            <Dropdown value={currentLocale} items={LANGUAGES} isTransparent={isTransparent}
                onCategotyChange={handleChange} dropdownKey='languageChanger' />
        </div>
    );
}