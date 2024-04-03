import React from 'react'

export default function Form() {
    return (
        <div className="space-y-6 sm:max-w-md m-auto mt-16">
            <div className="text-center">
                <div className="mt-5 space-y-2">
                    <h3 className="text-2xl font-semibold">Стать автором</h3>
                    <p className="">Чтобы стать автором, заполните форму ниже</p>
                </div>
            </div>
            <div className="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-5"
                >
                    <div>
                        <label className="font-medium">
                            ФИО
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="font-medium">
                            Организация
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="font-medium">
                            Должность
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="font-medium">
                            Электронная почта
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <button
                        className="w-full px-4 py-2 text-white font-medium bg-blue-600 hover:bg-blue-500 active:bg-blue-600 rounded-lg duration-150"
                    >
                        Отправить
                    </button>
                </form>
            </div>
        </div>
    )
}
