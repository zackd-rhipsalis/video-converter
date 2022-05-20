import logo from './logo.png';
import './App.css';

const Header =  () => {
  return (
    <header className='header'>
      <img src={logo} alt="logo" className='header-logo'/>
      <div className='header-text'>VIDEO CONVERTER</div>
      {/* <a href="#"><div>LINEと連携</div></a> */}
    </header>
  )
};

export default Header;