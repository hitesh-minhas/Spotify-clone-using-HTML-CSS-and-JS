console.log('Script Added');
let currentSong = new Audio()
let Songs;
let currentFolder;
currentSong.addEventListener('loadeddata', () => {
    document.getElementsByClassName('songtime')[0].innerHTML = formatTime(currentSong.currentTime)
    document.getElementsByClassName('duration')[0].innerHTML = formatTime(currentSong.duration)
})
// **************************************************************************************************************
//                                         Get songs from folder 
// ***************************************************************************************************************
async function GetSongs(folder) {
    currentFolder = folder;
    try {
        let Songs = await fetch(`/${folder}/`);
        if (!Songs.ok) throw new Error("Failed to fetch songs");
        let response = await Songs.text();
    } catch (error) {
        console.error(error);
    }
    Songs = await fetch(`/${folder}/`)
    let response = await Songs.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let SongLinks = div.getElementsByTagName("a")
    sg = []
    for (let index = 0; index < SongLinks.length; index++) {
        const element = SongLinks[index];
        if (element.href.endsWith(".mp3")) {
            let songlink = element.href.split(`/${folder}/`)[1]
            sg.push(songlink.replaceAll('%20', " "))
        }
    }
    return sg
}

// **************************************************************************************************************
//                                         Add songs to librray
// ***************************************************************************************************************
function AddSongToLibrary(songs) {
    let LibraryLower = document.querySelector(".LibraryLower")
    LibraryLower.innerHTML = " ";
    for (let index = 0; index < songs.length; index++) {
        const element = songs[index];
        LibraryLower.innerHTML += `<div class="SongCard">
                        <div class="SongCardImg flex">
                            <img src="Images/music.svg" alt="Music">
                        </div>
                        <div class="songinfo">
                            <p class="SongLink">${songs[index]}</p>
                        </div>
                        <div class="playnow flex">
                            <p>Play Now</p>
                            <img src="Images/play.svg" alt="Play Now">
                        </div>
                    </div>`
    }
    // Play song by clickng on Songcard in Library 
    Array.from(document.getElementsByClassName('SongCard')).forEach(element => {
        element.addEventListener('click', (e) => {
            playsong(element.querySelector('.SongLink').innerHTML)
            changeSongCardBG()
        })
    });
}

// **************************************************************************************************************
//                                       Changing background of song Card card clicked in Library
// ***************************************************************************************************************
function changeSongCardBG() {
    let Currentcard = currentSong.src.split(`${currentFolder}/`)[1].replaceAll("%20", " ")
    const cards = document.querySelectorAll(".SongCard");
    cards.forEach(c => {
        if (c.querySelector(" .songinfo .SongLink").innerHTML == Currentcard) {
            c.classList.add("CardActive");
            c.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
            if (!currentSong.paused) {
                c.querySelector(".playnow img").src = "Images/pause.svg"
            }
            else {
                c.querySelector(".playnow img").src = "Images/play.svg"
            }
        }
        else {
            c.classList.remove("CardActive")
            c.querySelector(".playnow img").src = "Images/play.svg"
        }
    });

}

// **************************************************************************************************************
//                                       Convert seconds to minutes to add in playbar
// ***************************************************************************************************************

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// **************************************************************************************************************
//                                         Play Songs and playbar functionality 
// ***************************************************************************************************************
function playsong(element, pause = false) {
    let SongTrack = `/${currentFolder}/` + element
    currentSong.src = SongTrack
    let songtitle = document.getElementsByClassName("title")[0]
    songtitle.innerHTML = element
    // Adding Duration and Total Time of song and moving seekbar
    currentSong.addEventListener('timeupdate', () => {
        document.getElementsByClassName('songtime')[0].innerHTML = formatTime(currentSong.currentTime)
        document.getElementsByClassName('duration')[0].innerHTML = formatTime(currentSong.duration)
        document.getElementsByClassName('seekbarcircle')[0].style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        // ADDING EVENTLISTENER TO MOVE SEEKBARCIRCLE WITH CLICK 
        document.getElementsByClassName("seekbar")[0].addEventListener('click', (e) => {
            let PositionClicked = e.offsetX
            let TotalSeekBarWidth = e.target.getBoundingClientRect().width
            let PercentClicked = (PositionClicked / TotalSeekBarWidth) * 100
            document.getElementsByClassName('seekbarcircle')[0].style.left = PercentClicked + "%"
            currentSong.currentTime = (currentSong.duration * PercentClicked) / 100
        })
    })
    if (!pause) {
        let playbutton = document.getElementById("play")
        playbutton.src = 'Images/pause.svg'
        currentSong.play()
    }
}



// **************************************************************************************************************
//                                         Display all Playlists                                                
// ***************************************************************************************************************
async function DisplayAlbums() {
    let Albums = await fetch('/songs/')
    let response = await Albums.text()
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let AllLinks = div.getElementsByTagName('a')
    let folderNames = []
    for (let index = 0; index < AllLinks.length; index++) {
        const element = AllLinks[index];
        if (element.href.includes("/songs/") && !element.href.includes("/songs/.htaccess")) {
            folderNames.push(element.href.split("/")[4])
        }
    }
    let Playlists = document.getElementsByClassName("playlists")[0]
    for (let index = 0; index < folderNames.length; index++) {
        const folder = folderNames[index];
        let info = await fetch(`/songs/${folder}/info.json`)
        let metaData = await info.json()
        Playlists.innerHTML += `
        <div class="card" data-folder=${folder}>
                    <div class="cover">
                        <img src="songs/${folder}/cover.jpg" alt="Cover Photo" class="CoverPhoto" />
                        <img src="Images/playanimation.svg" alt="Play" class="PlayIcon" />
                    </div>
                    <h3>${metaData.title}</h3>
                    <p>${metaData.description}</p>
                </div>
        `
    }
}

// ***************************************************************************************************************
//                                        Main function
// ***************************************************************************************************************
async function main() {
    let songs = await GetSongs("songs/DiljitDosanjh")
    playsong(songs[0], true)
    changeSongCardBG()

    await DisplayAlbums()

    AddSongToLibrary(songs)

    // Play song   by clickng on Songcard in Library 
    Array.from(document.getElementsByClassName('SongCard')).forEach(element => {
        element.addEventListener('click', () => {
            playsong(element.querySelector('.SongLink').innerHTML)
            changeSongCardBG()
        })
    });

    // Add Event Listener to play button 
    let playbutton = document.getElementById("play")
    playbutton.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            playbutton.src = 'Images/pause.svg'
            changeSongCardBG()
        }
        else {
            currentSong.pause()
            playbutton.src = 'Images/play.svg'
            changeSongCardBG()
        }
    })

    // Adding eventlistener on hamburger for media query 
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementsByClassName('left')[0].style.left = 0;
    })

    // Adding eventlistener on cross for media query 
    document.getElementById('cross').addEventListener('click', () => {
        console.log('Cross clicked');
        document.getElementsByClassName('left')[0].style.left = "-130%";
    })

    // Adding EventListener to Next buttons 
    let Next = document.getElementById("next");
    Next.addEventListener('click', () => {
        let currentSongPath = currentSong.src.split(`/${currentFolder}/`)[1];
        currentSongPath = decodeURIComponent(currentSongPath);
        let CurrentSongIndex = songs.indexOf(currentSongPath);
        if (CurrentSongIndex + 1 < songs.length) {
            playsong(songs[CurrentSongIndex + 1]);
            changeSongCardBG()
        } else {
            playsong(songs[0]);
            changeSongCardBG()
        }
    });

    // Adding EventListener Previous buttons
    let previous = document.getElementById("previous");
    previous.addEventListener("click", () => {
        currentSong.pause();
        let currentSongPath = currentSong.src.split(`/${currentFolder}/`)[1];
        currentSongPath = decodeURIComponent(currentSongPath);
        let index = songs.indexOf(currentSongPath);
        if (index - 1 >= 0) {
            playsong(songs[index - 1]);
            changeSongCardBG()
        } else {
            playsong(songs[songs.length - 1]);
            changeSongCardBG()
        }
    });

    // Add an event to volume
    document.querySelector(".footerright").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume == 0) {
            document.querySelector(".footerright img").src = "/Images/mute.svg"
        } else {
            document.querySelector(".footerright img").src = "/Images/volume.svg"
        }
    })

    // Load playlist when Card is clicked 
    let cards = Array.from(document.getElementsByClassName("card"))
    cards.forEach(element => {
        element.addEventListener('click', async (e) => {
            songs = await GetSongs(`songs/${e.currentTarget.dataset.folder}`)
            AddSongToLibrary(songs)
            playsong(songs[0])
            changeSongCardBG()
        })

    });

    // Play next songs when current songs is finsihed 
    currentSong.addEventListener('timeupdate', () => {
        if (currentSong.currentTime == currentSong.duration) {
            let currentindex = songs.indexOf(currentSong.src.split(`${currentFolder}/`)[1].replaceAll("%20", " "))
            if (currentindex == songs.length - 1) {
                playsong(songs[0], true)
                document.getElementById("play").src = 'Images/play.svg'
                changeSongCardBG()
            }
            else {
                playsong(songs[currentindex + 1])
                changeSongCardBG()
            }
        }
    })

    // Add Eventlistener to mute volume 
    document.getElementById("volumeimg").addEventListener('click', () => {
        let volumeImg = document.getElementById("volumeimg");
        if (volumeImg.src.endsWith("Images/volume.svg")) {
            volumeImg.src = "Images/mute.svg";
            currentSong.volume = 0;
            document.getElementById("volume").value = 0
            document.getElementById('volume').style.setProperty('--track-color', '#acc0ca');
            document.getElementById('volume').style.setProperty('--thumb-color', '#ff8d00');

        } else {
            volumeImg.src = "Images/volume.svg";
            currentSong.volume = 0.50;
            document.getElementById("volume").value = 50
            console.log(currentSong.volume * 100);
            document.getElementById('volume').style.setProperty('--track-color', '#1db954');
            document.getElementById('volume').style.setProperty('--thumb-color', '#FFFFFF');
        }
    });

    changeSongCardBG()

}
main()