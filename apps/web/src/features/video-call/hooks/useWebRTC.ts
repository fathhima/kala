import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store';
import type { IceServerConfigDto } from '@/api';

export interface PeerMediaState {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

export interface UseWebRTCOptions {
  bookingId: string;
  iceServers?: IceServerConfigDto[];
  enabled?: boolean;
  currentUserRole?: 'STUDENT' | 'INSTRUCTOR';
  onSessionEnded?: (reason?: string) => void;
}

export interface UseWebRTCReturn {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isConnected: boolean;
  isPeerPresent: boolean;
  connectionState: RTCPeerConnectionState;
  micOn: boolean;
  camOn: boolean;
  isScreenSharing: boolean;
  peerMediaState: PeerMediaState;
  elapsedSeconds: number;
  mediaError: string | null;
  toggleMic: () => void;
  toggleCam: () => void;
  toggleScreenShare: () => Promise<void>;
  endCall: () => void;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC({
  bookingId,
  iceServers,
  enabled = true,
  currentUserRole,
  onSessionEnded,
}: UseWebRTCOptions): UseWebRTCReturn {
  const { accessToken } = useAuthStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoSenderRef = useRef<RTCRtpSender | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  // State refs to prevent stale closures and avoid recreating socket/WebRTC listeners
  const onSessionEndedRef = useRef(onSessionEnded);
  onSessionEndedRef.current = onSessionEnded;

  const micOnRef = useRef(true);
  const camOnRef = useRef(true);
  const isScreenSharingRef = useRef(false);
  const isMountedRef = useRef(false);

  // Perfect Negotiation state refs (W3C pattern to eliminate glare / offer collision)
  const isPoliteRef = useRef(currentUserRole === 'STUDENT');
  isPoliteRef.current = currentUserRole === 'STUDENT';
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isPeerPresent, setIsPeerPresent] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peerMediaState, setPeerMediaState] = useState<PeerMediaState>({
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Keep state refs in sync
  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    camOnRef.current = camOn;
  }, [camOn]);

  useEffect(() => {
    isScreenSharingRef.current = isScreenSharing;
  }, [isScreenSharing]);

  // Timer: increment while connected
  useEffect(() => {
    if (connectionState !== 'connected') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [connectionState]);

  // Memoize ICE servers configuration so reference remains stable across renders
  const rtcIceServers: RTCIceServer[] = useMemo(() => {
    if (iceServers && iceServers.length > 0) {
      return iceServers.map((s) => ({
        urls: s.urls as unknown as string | string[],
        username: s.username,
        credential: s.credential,
      }));
    }
    return DEFAULT_ICE_SERVERS;
  }, [JSON.stringify(iceServers)]);

  // Acquire or reuse local camera/microphone stream
  const initializeLocalMedia = useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) {
      if (localVideoRef.current && localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      return localStreamRef.current;
    }

    try {
      setMediaError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.warn('Could not acquire audio/video stream with ideal settings, trying fallback:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = fallbackStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = fallbackStream;
        }
        return fallbackStream;
      } catch (fallbackErr) {
        const errorMsg =
          fallbackErr instanceof Error
            ? fallbackErr.message
            : 'Camera or microphone access was denied';
        setMediaError(errorMsg);
        return null;
      }
    }
  }, []);

  // Ensure local video element stays connected to the stream whenever mounted
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  });

  // Ensure remote video element stays connected to remote stream whenever mounted
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
    }
  });

  // Drain queued ICE candidates once remoteDescription is set
  const drainIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    while (iceCandidatesQueue.current.length > 0) {
      const cand = iceCandidatesQueue.current.shift();
      if (cand) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn('Error adding queued ICE candidate:', err);
        }
      }
    }
  }, []);

  // Create PeerConnection and bind event handlers
  const createPeerConnection = useCallback(
    (stream: MediaStream): RTCPeerConnection => {
      if (pcRef.current) {
        return pcRef.current;
      }

      const pc = new RTCPeerConnection({
        iceServers: rtcIceServers,
        iceCandidatePoolSize: 10,
      });

      // Add local stream tracks to PeerConnection and retain video sender ref
      stream.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, stream);
        if (track.kind === 'video') {
          videoSenderRef.current = sender;
        }
      });

      // Remote stream track handler
      pc.ontrack = (event) => {
        setIsPeerPresent(true);

        let remoteStream = event.streams[0];
        if (!remoteStream) {
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }
          remoteStreamRef.current.addTrack(event.track);
          remoteStream = remoteStreamRef.current;
        } else {
          remoteStreamRef.current = remoteStream;
        }

        if (remoteVideoRef.current) {
          if (remoteVideoRef.current.srcObject !== remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          remoteVideoRef.current.play().catch((playErr) => {
            console.info('Remote video autoplay pending user interaction:', playErr);
          });
        }

        event.track.onunmute = () => {
          setIsPeerPresent(true);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.play().catch(() => {});
          }
        };
      };

      // ICE Candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('signal_ice_candidate', {
            bookingId,
            candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
          });
        }
      };

      // Connection state changes
      pc.onconnectionstatechange = () => {
        if (!isMountedRef.current) return;
        setConnectionState(pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setIsConnected(false);
        }
      };

      // ICE Connection state changes
      pc.oniceconnectionstatechange = () => {
        if (!isMountedRef.current) return;
        if (pc.iceConnectionState === 'failed') {
          console.warn('ICE connection failed, attempting restart...');
          pc.restartIce?.();
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [bookingId, rtcIceServers],
  );

  // Send WebRTC Offer
  const sendOffer = useCallback(async () => {
    const pc = pcRef.current;
    const socket = socketRef.current;
    if (!pc || !socket) return;

    try {
      makingOfferRef.current = true;
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      // Guard against race conditions where signaling state changed during createOffer
      if (pc.signalingState !== 'stable') {
        return;
      }

      await pc.setLocalDescription(offer);
      socket.emit('signal_offer', {
        bookingId,
        sdp: pc.localDescription,
      });
    } catch (error) {
      console.error('Failed to create and send offer:', error);
    } finally {
      makingOfferRef.current = false;
    }
  }, [bookingId]);

  // Main Socket.IO connection & WebRTC lifecycle
  // NOTE: Dependencies are strictly [bookingId, accessToken, enabled].
  // All internal state/callbacks are accessed via refs or stable handlers to prevent
  // the socket from disconnecting/reconnecting on every state update (which caused UI shivering).
  useEffect(() => {
    if (!enabled || !bookingId || !accessToken) return;

    isMountedRef.current = true;

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socket = io(`${apiBaseUrl}/video-call`, {
      auth: { token: `Bearer ${accessToken}` },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', async () => {
      if (!isMountedRef.current) return;
      setIsConnected(true);

      const stream = await initializeLocalMedia();
      if (!stream) return;

      createPeerConnection(stream);
      socket.emit('join_session', { bookingId });
    });

    socket.on('disconnect', () => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    // When this peer joins, announce current media state
    socket.on('session_joined', (res: any) => {
      if (!isMountedRef.current) return;
      const otherPresent = Boolean(res?.otherPeerPresent ?? res?.data?.otherPeerPresent);
      setIsPeerPresent(otherPresent);

      // Inform the other peer of our initial media state (mic/camera/screen-share)
      socket.emit('media_state_change', {
        bookingId,
        isMuted: !micOnRef.current,
        isCameraOff: !camOnRef.current,
        isScreenSharing: isScreenSharingRef.current,
      });

      // If the other peer is already in the room, send an offer if they don't within 1.2s
      if (otherPresent) {
        setTimeout(() => {
          if (
            isMountedRef.current &&
            pcRef.current &&
            pcRef.current.signalingState === 'stable' &&
            !pcRef.current.remoteDescription
          ) {
            console.info('Initiating fallback offer from newcomer to existing peer...');
            sendOffer();
          }
        }, 1200);
      }
    });

    // When the other peer joins the room
    socket.on('peer_joined', () => {
      if (!isMountedRef.current) return;
      setIsPeerPresent(true);

      // Announce our current media state to the newcomer
      socket.emit('media_state_change', {
        bookingId,
        isMuted: !micOnRef.current,
        isCameraOff: !camOnRef.current,
        isScreenSharing: isScreenSharingRef.current,
      });

      // Existing peer initiates the WebRTC offer
      sendOffer();
    });

    socket.on('peer_left', () => {
      if (!isMountedRef.current) return;
      setIsPeerPresent(false);
      setConnectionState('disconnected');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      remoteStreamRef.current = null;
    });

    // Handle incoming WebRTC Offer with Perfect Negotiation (polite vs impolite collision handling)
    socket.on(
      'signal_offer',
      async (data: { senderId: string; sdp: RTCSessionDescriptionInit }) => {
        if (!isMountedRef.current) return;
        setIsPeerPresent(true);

        try {
          let pc = pcRef.current;
          if (!pc) {
            const stream = await initializeLocalMedia();
            if (stream) {
              pc = createPeerConnection(stream);
            }
          }
          if (!pc) return;

          const offerCollision =
            data.sdp.type === 'offer' &&
            (makingOfferRef.current || pc.signalingState !== 'stable');

          ignoreOfferRef.current = !isPoliteRef.current && offerCollision;
          if (ignoreOfferRef.current) {
            console.warn('Glare detected: Impolite peer ignoring incoming colliding offer.');
            return;
          }

          if (offerCollision && isPoliteRef.current) {
            console.info('Glare detected: Polite peer rolling back local offer.');
            await pc.setLocalDescription({ type: 'rollback' });
          }

          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          await drainIceCandidates(pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('signal_answer', {
            bookingId,
            sdp: pc.localDescription,
          });
        } catch (err) {
          console.error('Error handling signal_offer:', err);
        }
      },
    );

    // Handle incoming WebRTC Answer
    socket.on(
      'signal_answer',
      async (data: { senderId: string; sdp: RTCSessionDescriptionInit }) => {
        if (!isMountedRef.current || !pcRef.current) return;
        setIsPeerPresent(true);

        try {
          const pc = pcRef.current;
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            await drainIceCandidates(pc);
          }
        } catch (err) {
          console.error('Error handling signal_answer:', err);
        }
      },
    );

    // Handle incoming ICE Candidate
    socket.on('signal_ice_candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      if (!isMountedRef.current || !data.candidate) return;
      setIsPeerPresent(true);
      const pc = pcRef.current;

      try {
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          iceCandidatesQueue.current.push(data.candidate);
        }
      } catch (err) {
        if (!ignoreOfferRef.current) {
          console.warn('Error adding ICE candidate:', err);
        }
      }
    });

    // Handle remote peer mute / video-off / screen-sharing updates
    socket.on(
      'peer_media_state',
      (state: { isMuted: boolean; isCameraOff: boolean; isScreenSharing: boolean }) => {
        if (!isMountedRef.current) return;
        setIsPeerPresent(true);
        setPeerMediaState({
          isMuted: Boolean(state.isMuted),
          isCameraOff: Boolean(state.isCameraOff),
          isScreenSharing: Boolean(state.isScreenSharing),
        });
      },
    );

    // Administrative session end
    socket.on('session_ended', (data: { reason?: string }) => {
      if (!isMountedRef.current) return;
      onSessionEndedRef.current?.(data?.reason);
    });

    return () => {
      isMountedRef.current = false;

      // Stop local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      // Stop screen sharing if any
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      // Close PeerConnection
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      // Disconnect socket
      if (socket) {
        socket.emit('leave_session', { bookingId });
        socket.disconnect();
      }

      socketRef.current = null;
      videoSenderRef.current = null;
      remoteStreamRef.current = null;
      iceCandidatesQueue.current = [];
    };
  }, [bookingId, accessToken, enabled, initializeLocalMedia, createPeerConnection, sendOffer, drainIceCandidates]);

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (!localStreamRef.current) return;

    const nextState = !micOnRef.current;
    micOnRef.current = nextState;
    setMicOn(nextState);

    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = nextState;
    });

    socketRef.current?.emit('media_state_change', {
      bookingId,
      isMuted: !nextState,
      isCameraOff: !camOnRef.current,
      isScreenSharing: isScreenSharingRef.current,
    });
  }, [bookingId]);

  // Toggle Camera
  const toggleCam = useCallback(() => {
    if (!localStreamRef.current) return;

    const nextState = !camOnRef.current;
    camOnRef.current = nextState;
    setCamOn(nextState);

    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = nextState;
    });

    socketRef.current?.emit('media_state_change', {
      bookingId,
      isMuted: !micOnRef.current,
      isCameraOff: !nextState,
      isScreenSharing: isScreenSharingRef.current,
    });
  }, [bookingId]);

  // Helper to stop screen share and restore camera track
  const stopScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    if (screenTrackRef.current) {
      screenTrackRef.current.onended = null;
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    const videoSender =
      videoSenderRef.current ||
      pc.getSenders().find((s) => s.track?.kind === 'video' || (s.transport && !s.track));

    if (videoSender && cameraTrack) {
      try {
        await videoSender.replaceTrack(cameraTrack);
      } catch (err) {
        console.warn('Failed to restore camera track:', err);
      }
    }

    isScreenSharingRef.current = false;
    setIsScreenSharing(false);

    socketRef.current?.emit('media_state_change', {
      bookingId,
      isMuted: !micOnRef.current,
      isCameraOff: !camOnRef.current,
      isScreenSharing: false,
    });
  }, [bookingId]);

  // Toggle Screen Sharing
  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    if (isScreenSharingRef.current) {
      await stopScreenShare();
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError('Screen sharing is not supported on this browser or device');
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        } as MediaTrackConstraints,
        audio: false,
      });

      const screenTrack = displayStream.getVideoTracks()[0];
      if (!screenTrack) return;

      screenTrackRef.current = screenTrack;

      const videoSender =
        videoSenderRef.current ||
        pc.getSenders().find((s) => s.track?.kind === 'video' || (s.transport && !s.track));

      if (videoSender) {
        // Seamlessly swap the outgoing video RTP stream to the screen track
        await videoSender.replaceTrack(screenTrack);
      } else {
        // Fallback if call had no camera track initially
        const sender = pc.addTrack(screenTrack, displayStream);
        videoSenderRef.current = sender;
        sendOffer();
      }

      isScreenSharingRef.current = true;
      setIsScreenSharing(true);

      socketRef.current?.emit('media_state_change', {
        bookingId,
        isMuted: !micOnRef.current,
        isCameraOff: !camOnRef.current,
        isScreenSharing: true,
      });

      // Browser native "Stop sharing" blue floating bar handler
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      // User cancelled picker or denied permission
      console.info('Screen share prompt was cancelled or denied:', err);
    }
  }, [bookingId, sendOffer, stopScreenShare]);

  // End Call
  const endCall = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave_session', { bookingId });
    }
  }, [bookingId]);

  return {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isPeerPresent,
    connectionState,
    micOn,
    camOn,
    isScreenSharing,
    peerMediaState,
    elapsedSeconds,
    mediaError,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    endCall,
  };
}
