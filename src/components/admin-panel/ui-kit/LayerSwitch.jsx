import { memo } from 'react';

const LayerSwitch = memo(function LayerSwitch({ title, type, visible, onVisibleChange }) {
    return <div className="form-control">
        <label className="flex justify-between cursor-pointer label">
            <span className="label-text">{title}</span>
            <label className="inline-flex items-center cursor-pointer">
                <input
                    checked={visible}
                    onChange={onVisibleChange}
                    type="checkbox"
                    name={type}
                    className="sr-only peer toggle layerCheker toggle-primary"
                />
                <div className={`relative w-10 h-[22px] bg-gray-200 rounded-full peer peer-checked:after:translate-x-full 
          rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
          after:absolute after:top-0.5 after:start-[1px] after:bg-white after:border-gray-300 after:border 
          after:rounded-full after:h-[18px] after:w-[18px] after:transition-all 

          ${type === 'soil' ? 'peer-checked:bg-[#993300]/80'
                        : type === 'ecosystem' ? 'peer-checked:bg-[#73ac13]/80' : 'peer-checked:bg-[#8b008b]/80'}
          `}></div>
            </label>
        </label>
    </div>
})
export default LayerSwitch;
