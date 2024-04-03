import React from 'react'

export default function PublicationsPage() {
    const publications = [
        {
            type: "Статья",
            title: "Математическое моделирование взаимодействия одиночной сверхзвуковой струи с подвижной преградой",
            authors: "Kagenov, A.M., Kostyushin, K.V., Chervakova, A.V., Eremin, I.V.",
            journal: "Vestnik Tomskogo Gosudarstvennogo Universiteta, Matematika i MekhanikaЭта ссылка отключена., 2022, (78), страницы 49–59",

        }, {
            type: "Статья",
            title: "Математическое моделирование взаимодействия одиночной сверхзвуковой струи с подвижной преградой",
            authors: "Kagenov, A.M., Kostyushin, K.V., Chervakova, A.V., Eremin, I.V.",
            journal: "Vestnik Tomskogo Gosudarstvennogo Universiteta, Matematika i MekhanikaЭта ссылка отключена., 2022, (78), страницы 49–59",

        }, {
            type: "Статья",
            title: "Математическое моделирование взаимодействия одиночной сверхзвуковой струи с подвижной преградой",
            authors: "Kagenov, A.M., Kostyushin, K.V., Chervakova, A.V., Eremin, I.V.",
            journal: "Vestnik Tomskogo Gosudarstvennogo Universiteta, Matematika i MekhanikaЭта ссылка отключена., 2022, (78), страницы 49–59",

        }
    ]
    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-4'>
                Публикации
            </h1>
            <div className='relative flex flex-row space-x-2 mb-4'>
                <div className="relative w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        // value={filterName}
                        //     onChange={(e) => setFilterName(e.target.value)}
                        type="text"
                        placeholder="Найти по названию"
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
                <button className="w-[200px] justify-center py-2 font-medium text-center text-white transition-all duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 active:bg-blue-600 flex flex-row items-center space-x-2">
                    Найти
                </button>
            </div>

            <section className="">
                <div className="mx-auto ">
                    <ul className="">
                        {
                            publications.map((item, idx) => (
                                <li key={idx} className="mt-4 border-b flex flex-row">
                                    <div className='flex-1 space-y-3 mb-4 px-4 py-5 border border-transparent duration-300 cursor-pointer rounded-lg hover:bg-white'>

                                        <div className="flex items-center gap-x-3">

                                            <div>
                                                <span className="block text-sm text-indigo-600 font-medium">{item.type}</span>
                                                <h3 className="text-base text-gray-800 font-semibold mt-1">{item.title}</h3>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 sm:text-sm">
                                            {item.authors}
                                        </p>
                                        <div className="text-sm text-gray-600 flex items-center gap-6">
                                            <span className="flex items-center gap-2">

                                                {item.journal}
                                            </span>
                                            <span className="flex items-center gap-2">


                                                {item.location}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='w-fit'>crfxfnm</div>

                                </li>
                            ))
                        }
                    </ul>
                </div>
            </section>
        </div>
    )
}
