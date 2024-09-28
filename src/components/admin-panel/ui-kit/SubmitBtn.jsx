import { Oval } from 'react-loader-spinner';

export default function SubmitBtn({ isSubmitting, btnText, onClick }) {

    const handleClick = (e) => {
        !!onClick && onClick(e);
    }

    // md:min-w-[200px] md:w-fit 
    return (
        <button
            type='submit'
            onClick={handleClick}
            disabled={isSubmitting}
            className="self-end min-h-[40px] w-full flex items-center justify-center px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 disabled:bg-blue-600/70 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 align-bottom">
            {isSubmitting ?
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
    )
}
