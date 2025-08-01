const SignUpComponent = () => {
    const [alignment, setAlignment] = React.useState('left');

    const handleAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    return (
        <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="text alignment"
            fullWidth // 그룹 전체가 부모의 너비에 맞게 꽉 차게
            sx={{ mt: 2 }} // margin-top 등 여백 조절도 가능
        >
            <ToggleButton
            value="user"
            aria-label="left aligned"
            sx={{ width: '50%' }} // 각 버튼의 너비를 50%로
            >
                화주
            </ToggleButton>
            <ToggleButton
                value="car"
                aria-label="centered"
                sx={{ width: '50%' }}
            >
                차주
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
export default SignUpComponent