import React from "react";
import "./ModalPage.css";

const ModalPage = ({active, setActive, data}) => {
    return (
        <div className={active ? "modal active" : "modal"} onClick={() => setActive(false)}>
            <div className={active ? "modal__content active" : "modal__content"} onClick={e => e.stopPropagation()}>
                {data}
            </div>
        </div>
    );
};

export default ModalPage;