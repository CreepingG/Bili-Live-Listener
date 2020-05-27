/* eslint-disable no-console */
const {$send, axios} = window;

const btn = document.getElementById('btn');
const input = document.getElementById('input');

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
function SendNotification(title, body, url, icon){
    $send({
        action: 'notify',
        title,
        body,
        url,
        icon
    });
}

let cnt = 0;

btn.onclick = async function(){
    let taskId = ++cnt;
    const text = input.value;
    $send({
        action: 'write',
        data: text
    });

    let roomids = [...text.matchAll(/\d+/g)].map(v=>Number(v[0]));
    console.log(roomids);
    let infos = await Promise.all(roomids.map(GetParsedInfo));
    infos.forEach(info => {
        console.log(info);
    });
    // 使用url下载头像并记录，供通知使用
    let avatars = infos.map(info=>{
        const fileName = info.name + info.avatar.match(/\.\w+$/)[0];
        $send({
            action: 'saveImg',
            url: info.avatar,
            fileName: fileName,
        });
        return fileName;
    });
    ShowList(infos);
    let task = setInterval(async function(){
        if (taskId !== cnt){
            clearInterval(task);
        }
        let newInfos = await Promise.all(roomids.map(GetParsedInfo));
        for(let i in newInfos){
            if (!parseInt(i)) continue;
            let newInfo = newInfos[i];
            let prev = infos[i].status;
            let cur = newInfo.status;
            if (cur !== prev){
                infos[i] = newInfo;
                if (cur){
                    SendNotification(newInfo.name + '开播了', newInfo.title, newInfo.url, avatars[i]);
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