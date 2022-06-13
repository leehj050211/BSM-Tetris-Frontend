import React from "react";

interface PropsType {
    setPageMode: React.Dispatch<React.SetStateAction<string>>,
    setUsername: React.Dispatch<React.SetStateAction<string>>
}

const TitleScreen: React.FC<PropsType> = (props: PropsType) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const confirmUsername = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const username = inputRef.current?.value;
        if (typeof username == 'undefined') {
            return alert('닉네임 설정 중에 문제가 발생하였습니다.');
        }
        props.setUsername(() => username);
        props.setPageMode('match');
    }

    return (
        <div className="title">
            <h1>BSM Tetris</h1>
            <form onSubmit={confirmUsername}>
                <input
                    ref={inputRef}
                    name="username"
                    type="text"
                    placeholder=""
                    required
                />
                <button>게임 시작</button>
            </form>
        </div>
    );
}

export default TitleScreen