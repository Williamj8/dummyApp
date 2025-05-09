import { Form } from 'antd';
import './style.css';
import { useState } from 'react';

function FormComponent() {
    const formData = {
        name: "", email: "", phone: ""
    };

    const [val, setVal] = useState(formData)

    const handleInput = (e: any) => {
        setVal({ ...val, [e.target.name]: e.target.value })

        // console.log(val)
    }

    const submit = (e: any) => {
        e.preventDefault();
       console.log(val)
    }

    return (
        <form className="container">
            <div>
                <input placeholder='name' name='name' type='text' className='nameInput' value={val.name}
                    onChange={handleInput} required />
            </div>

            <div>
                <input placeholder='email' name='email' type='email' className='nameInput' value={val.email}
                    onChange={handleInput} required />
            </div>
            <div>
                <input placeholder='phone' name='phone' type='number' className='nameInput' value={val.phone}
                    onChange={handleInput} required />
            </div>

            <button onClick={submit}>submit</button>
        </form>
    )
}

export default FormComponent;