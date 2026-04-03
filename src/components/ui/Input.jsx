const Input=({label,error,...props})=><label className='input-field'><span>{label}</span><input {...props}/>{error?<small className='field-error'>{error}</small>:null}</label>;export default Input;
