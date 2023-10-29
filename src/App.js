import React, {useEffect, useState} from "react";
import {Constants, MeetingProvider} from "@videosdk.live/react-sdk";
import {LeaveScreen} from "./components/screens/LeaveScreen";
import {JoiningScreen} from "./components/screens/JoiningScreen";
import {MeetingContainer} from "./meeting/MeetingContainer";
import {MeetingAppProvider} from "./MeetingAppContextDef";

const App = () => {
	const [token, setToken] = useState("");
	const [meetingId, setMeetingId] = useState("");
	const [participantName, setParticipantName] = useState("");
	const [micOn, setMicOn] = useState(true);
	const [webcamOn, setWebcamOn] = useState(true);
	const [selectedMic, setSelectedMic] = useState({id: null});
	const [selectedWebcam, setSelectedWebcam] = useState({id: null});
	const [selectWebcamDeviceId, setSelectWebcamDeviceId] = useState(
		selectedWebcam.id
	);
	const [meetingMode, setMeetingMode] = useState(Constants.modes.CONFERENCE);
	const [selectMicDeviceId, setSelectMicDeviceId] = useState(selectedMic.id);
	const [isMeetingStarted, setMeetingStarted] = useState(false);
	const [isMeetingLeft, setIsMeetingLeft] = useState(false);

	const isMobile = window.matchMedia(
		"only screen and (max-width: 768px)"
	).matches;

	useEffect(() => {
		if (isMobile) {
			window.onbeforeunload = () => {
				return "Are you sure you want to exit?";
			};
		}
	}, [isMobile]);

	// doing it temp
	const [data, setData] = useState(null);
	// get meeting Id
	useEffect(() => {
		const fetchData = async () => {
			try {
				const options = {
					method: "POST",
					headers: {
						Authorization: process.env.REACT_APP_VIDEOSDK_TOKEN,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						region: "sg001",
						customRoomId: "aaa-bbb-ccc",
						autoCloseConfig: {
							type: "session-end-and-deactivate",
							duration: 1,
						},
					}),
				};

				const url = "https://api.videosdk.live/v2/rooms";
				const response = await fetch(url, options);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const responseData = await response.json();
				setData(responseData?.roomId);
				console.log(responseData?.roomId);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	return (
		<>
			{isMeetingStarted ? (
				<MeetingAppProvider
					selectedMic={selectedMic}
					selectedWebcam={selectedWebcam}
					initialMicOn={micOn}
					initialWebcamOn={webcamOn}
				>
					{console.log("from here too", data)}
					<MeetingProvider
						config={{
							meetingId: data,
							micEnabled: micOn,
							webcamEnabled: webcamOn,
							name: participantName ? participantName : "TestUser",
							mode: meetingMode,
							multiStream: true,
						}}
						token={process.env.REACT_APP_VIDEOSDK_TOKEN}
						reinitialiseMeetingOnConfigChange={true}
						joinWithoutUserInteraction={true}
					>
						<MeetingContainer
							onMeetingLeave={() => {
								setToken("");
								setMeetingId("");
								setParticipantName("");
								setWebcamOn(false);
								setMicOn(false);
								setMeetingStarted(false);
							}}
							setIsMeetingLeft={setIsMeetingLeft}
							selectedMic={selectedMic}
							selectedWebcam={selectedWebcam}
							selectWebcamDeviceId={selectWebcamDeviceId}
							setSelectWebcamDeviceId={setSelectWebcamDeviceId}
							selectMicDeviceId={selectMicDeviceId}
							setSelectMicDeviceId={setSelectMicDeviceId}
							micEnabled={micOn}
							webcamEnabled={webcamOn}
							
						/>
					</MeetingProvider>
				</MeetingAppProvider>
			) : isMeetingLeft ? (
				<LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
			) : (
				<JoiningScreen
					participantName={participantName}
					setParticipantName={setParticipantName}
					setMeetingId={setMeetingId}
					setToken={setToken}
					setMicOn={setMicOn}
					micEnabled={micOn}
					webcamEnabled={webcamOn}
					setSelectedMic={setSelectedMic}
					setSelectedWebcam={setSelectedWebcam}
					setWebcamOn={setWebcamOn}
					onClickStartMeeting={() => {
						setMeetingStarted(true);
					}}
					startMeeting={isMeetingStarted}
					setIsMeetingLeft={setIsMeetingLeft}
					meetingMode={meetingMode}
					setMeetingMode={setMeetingMode}
					roomId={data}
				/>
			)}
		</>
	);
};

export default App;
