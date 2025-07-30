import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { loginPost } from "../api/memberApi";

//인증시 사용되는 기본 데이터를 초기화 합니다. 우린 email 을  id 로 사용했으니 email 로 
const initState={
    email:'',

}
//여기서는 리덕스의 비동기통신 함수를 이용해서 API 의 서버전송 함수를 호출하고, 이에 따른 결과를
//비동기적으로 처리하는 extraReducers 를 통해 제어 한다
//API 를 호출하고,결과를 기다리는 함수 객체 생성
export const loginPostAsync = createAsyncThunk('loginPostAsync',(param)=>{
    return loginPost(param)
})



//slice 생성은 createSlice 함수를 통해서 한다
//내부에는 슬라이스 이름, 초기상태값, reducers(상태를 가지고 어떤 action 을 처리할지를 정의한다. 즉 컴포넌트에
//호출할 액션등을 선언함)

const loginSlice = createSlice({ 
    name : 'LoginSlice',
    initialState:initState,
    reducers:{
        login:(state,action)=>{
            console.log("로그인 수행됨")
            console.log(state)
           
            //action 파라미터는 속성으로 payload 가 있다.. 애는 전달 되는 데이터를 담고 있다
            //애를 이용해서 화면에서 전달된 email 을 새로운 상태값으로 변경해봄 
            console.log(action.payload)
            const data= action.payload;
 
            return {email:data.email,nickname:data.nickname,pw:data.pw}

             //전달된 상태값을 받아서 이를 새로운 상태로 리턴시켜줍니다
        },
        logout:(state,action)=>{
            console.log('로그아웃 수행됨')
            return {...initState}
        }  
    },
    extraReducers:(builder)=>{
        builder.addCase(loginPostAsync.fulfilled,(state,action)=>{
            console.log('fulfilld')
            const data = action.payload;
            return data
            
        })
        .addCase(loginPostAsync.pending,(state,action)=>{
            console.log('pending')
        })
        .addCase(loginPostAsync.rejected,(state,action)=>{
            console.log("rejected")
        })
        
    }
});

export const{login,logout} =loginSlice.actions;
export default loginSlice.reducer;