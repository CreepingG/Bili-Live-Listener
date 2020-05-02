/* eslint-disable no-console */
const {$send, axios} = window;

const btn = document.getElementById('btn');
const input = document.getElementById('input');

input.oninput = function(){ /* 高度自适应 */
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
};
input.value = window.$text;
input.oninput();

function GetRawInfo(roomid){
    return axios.get('https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=' + roomid).then(result=>result.data.data);
}

async function GetParsedInfo(roomid){
    let info = await GetRawInfo(roomid);
    console.log(info);
    let room = info.room_info;
    let user = info.anchor_info.base_info;
    return {
        roomid: roomid,
        status: room.live_status,
        title: room.title,
        cover: room.cover,
        url: 'https://live.bilibili.com/' + roomid,
        name: user.uname,
        avatar: user.face,
    };
}

function ShowList(list){
    let ul = document.getElementById('list');
    ul.innerText = '';
    list.forEach(info=>{
        let li = document.createElement('li');
        li.innerHTML = info.name + '：' + (info.status ? info.title : '<span style="color:gray">未开播</span>');
        if (info.status){
            li.style.cursor = 'pointer';
            li.onclick = function(){
                $send({
                    action: 'open',
                    url: info.url
                });
            };
        }
        ul.appendChild(li);
    });
}
function SendNotification(title, body, url){
    $send({
        action: 'notify',
        title,
        body,
        url
    });
}

let cnt = 0;

btn.onclick = async function(){
    let taskId = ++cnt;
    const text = input.value;
    $send({
        data: text
    });

    let roomids = [...text.matchAll(/\d+/g)].map(v=>Number(v[0]));
    console.log(roomids);
    let infos = await Promise.all(roomids.map(GetParsedInfo));
    infos.forEach(info => {
        console.log(info);
    });
    ShowList(infos);
    let task = setInterval(async function(){
        if (taskId !== cnt){
            clearInterval(task);
        }
        let newInfos = await Promise.all(roomids.map(GetParsedInfo));
        // eslint-disable-next-line guard-for-in
        for(let i in newInfos){
            let newInfo = newInfos[i];
            let prev = infos[i].status;
            let cur = newInfo.status;
            if (cur !== prev){
                infos[i] = newInfo;
                if (cur){
                    SendNotification(newInfo.name + '开播了', newInfo.title, newInfo.url);
                }
            }
        }
    }, 30 * 1000);
};

/* f12打开控制台 */
window.onkeydown = (ev)=>{
    if(ev.key === 'F12'){
        $send({
            action: 'f12'
        });
    }
};