export const START_TIME = 'START_TIME';
export const PAUSE_TIME = 'PAUSE_TIME';
export const RESET_TIME = 'RESET_TIME';

const initialState = {
    members:[],
    time:{
        isStart:false,
        isPause:false,
        isReset:false
    }
}

export default function ( state = initialState , {type,payload}) {
     switch(type){
         case START_TIME:
            const isDuplicate = state.members.findIndex((m) => m.userId == payload.user.id) > -1
            const newMember = {
                userId: payload.user.id,
              }
            if (isDuplicate) return state
             return {...state , members:[...state.members,newMember]}
         case PAUSE_TIME:
            return {...state , members:[...state.members,payload.user.id]}
         case RESET_TIME:
            return {...state , members:[...state.members,payload.user.id]}  
         default:
             return state;    

     }
}

export const StartTime = (payload) => ( { type:START_TIME , payload} )
export const PauseTime = (payload) => ( { type:PAUSE_TIME ,payload} )
export const ResetTime = () => ( { type:RESET_TIME } )
