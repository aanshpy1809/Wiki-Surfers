import { FaMale, FaFemale } from 'react-icons/fa';

const GenderCheckbox = ({ onCheckBoxChange, selectedGender }) => {
	return (
		<div className='flex gap-4'>
			<div className='form-control'>
				<label className='label gap-2 cursor-pointer items-center'>
					<FaMale className={`text-xl ${selectedGender === 'male' ? "text-orange-500" : "text-slate-500"}`} />
					<span className='label-text mr-2'>Male</span>
					<input 
                        type='checkbox' 
                        className='checkbox border-slate-900' 
                        checked={selectedGender === 'male'} 
                        onClick={() => onCheckBoxChange('male')} 
                    />
				</label>
			</div>
			<div className='form-control'>
				<label className='label gap-2 cursor-pointer items-center'>
					<FaFemale className={`text-xl ${selectedGender === 'female' ? "text-orange-500" : "text-slate-500"}`} />
					<span className='label-text mr-2'>Female</span>
					<input 
                        type='checkbox' 
                        className='checkbox border-slate-900' 
                        checked={selectedGender === 'female'} 
                        onClick={() => onCheckBoxChange('female')} 
                    />
				</label>
			</div>
		</div>
	);
};

export default GenderCheckbox;
