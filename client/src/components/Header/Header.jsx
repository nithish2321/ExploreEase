import React, {useRef, useEffect} from "react";
import { Container, Row, Button} from "reactstrap";
import { NavLink, Link, useNavigate} from "react-router-dom";
import logo from "../../assets/logo.png";
import useFetch from '../../hooks/fetch.hook';

import "./Header.css";

const nav_links=[
  {
    path:"/home",
    display:"Home",
  },
  {
    path:"/tours",
    display:"Tours",
  },
  {
    path:"/chatbot",
    display:"Assistant",
  },
  {
    path:"/gallery",
    display:"Gallery",
  },

];

const Header = () => {

  const [{ isLoading, apiData, serverError }] = useFetch();

  const headerRef = useRef(null)

  const navigate = useNavigate()

  const username = apiData?.username;
 

  const stickyHeaderFunc = () =>{
    window.addEventListener("scroll", () =>{
      if(document.body.scrollTop >80 || document.documentElement.scrollTop >80){
        headerRef.current.classList.add("sticky__header");
      }else{
        headerRef.current.classList.remove("sticky__header");
      }
    });
  };

  useEffect(()=>{
    stickyHeaderFunc();
    return window.removeEventListener("scroll", stickyHeaderFunc);
  });

  function userLogout(){
    localStorage.removeItem('token')
    navigate('/')
    
  }

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav__wrapper d-flex align-items-center justify-content-between">

            <div className="logo">
              <img src={logo} alt=""/>
            </div>

            <div className="navigation">
                <ul className="menu d-flex align-items-center gap-5">
                    {
                        nav_links.map((item,index)=>(
                            <li className="nav__item" key={index}>
                                <NavLink to={item.path} className={navClass=> navClass.isActive ? "active__link" : ""}>
                                    {item.display}</NavLink>
                            </li>
                        ))
                    }
                </ul>
            </div>

            <div className="nav__right d-flex align-items-center gap-4">
            {localStorage.getItem('token') ? (
                <>
                  <Button className="btn secondary__btn">
                    <Link to="/profile">{username ||"Loading..."}</Link>
                  </Button>
                  <Button onClick={userLogout} className="primary1__Rbtn" to="/">Logout</Button>
                </>
              ) : (
                <div className="nav__btns d-flex align-items-center gap-4">
                  <Button className="btn secondary__btn">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button className="btn primary__btn">
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}

                <span className="mobile__menu">
                    <i class="ri-menu-line"></i>
                </span>
            </div>
          </div>
        </Row>
      </Container>
    </header>
  );
};

export default Header;