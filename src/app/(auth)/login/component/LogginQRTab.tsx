"use client";

import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Panel } from "../../Auth.styles";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { connectSocket, getSocket } from "@/src/common/socket/socket";
import {
  setRefreshToken,
  setSessionToken,
  setSessionTokenExpiresIn,
} from "@/src/common/utilities/utils";
import { QrBindIssuedPayload, QrConfirmedPayload, QrRejectedPayload, UiStatus, WsErrorPayload } from "@/src/common/interface/qr-interface";
import { qrService } from "@/src/common/service/qr-service";

const QRBox = styled(Box)({
  boxSizing: "border-box",
  width: "100%",
  margin: "0 auto",
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  padding: 24,
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
});

const QRPlaceholder = styled(Box)({
  width: 260,
  height: 260,
  borderRadius: 16,
  background:
    "linear-gradient(135deg, rgba(5,115,255,0.08) 0%, rgba(5,115,255,0.02) 100%)",
  border: "1px dashed rgba(5,115,255,0.35)",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const HelperText = styled(Typography)({
  textAlign: "center",
  color: "#0573ff",
  fontWeight: 600,
  fontSize: 16,
});

const HelperText2 = styled(Typography)({
  textAlign: "center",
  color: "#111827",
  fontWeight: 500,
  fontSize: 16,
});

export const QrWrapper = styled(Box)({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const QrOverlay = styled(Box)({
  position: "absolute",
  inset: 0,
  borderRadius: 16,
  backgroundColor: "rgba(255,255,255,0.9)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  textAlign: "center",
});

export const CountdownText = styled(Typography)({
  fontSize: 14,
  color: "#6B7280",
  textAlign: "center",
  fontWeight: 500,
});



export default function LoginQrTab() {
  const Trans = useTrans();

  const [qrValue, setQrValue] = useState("");
  const [qrStatus, setQrStatus] = useState<UiStatus>("LOADING");
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");

  const countdownRef = useRef<number | null>(null);
  const startingRef = useRef(false);
  const bindFlowIdRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

  const stopCountdown = () => {
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
    }
    countdownRef.current = null;
  };

  const startCountdown = (seconds: number) => {
    stopCountdown();
    setTimeLeft(seconds);

    countdownRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopCountdown();
          setQrStatus("EXPIRED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cleanupQrListeners = () => {
    const socket = getSocket();
    socket?.off("qr:bind:issued");
    socket?.off("qr:confirmed");
    socket?.off("qr:rejected");
    socket?.off("ws:error");
  };

  const ensureSocketConnected = async () => {
    const socket = connectSocket();

    if (socket.connected && socket.id) {
      return socket;
    }

    return await new Promise<typeof socket>((resolve, reject) => {
      let lastError: unknown = null;

      const cleanup = () => {
        clearTimeout(timeoutId);
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
      };

      const onConnect = () => {
        cleanup();
        resolve(socket);
      };

      const onError = (err: unknown) => {
        lastError = err;
      };

      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(
          lastError instanceof Error
            ? lastError
            : new Error("Socket connection timeout after 20s"),
        );
      }, 20000);

      socket.on("connect", onConnect);
      socket.on("connect_error", onError);

      if (!socket.active) {
        socket.connect();
      }
    });
  };

  const startQrLogin = async () => {
    if (startingRef.current) return;

    startingRef.current = true;
    const flowId = Date.now();
    bindFlowIdRef.current = flowId;

    try {
      stopCountdown();
      cleanupQrListeners();

      setQrStatus("LOADING");
      setQrValue("");
      setTimeLeft(0);
      setError("");

      const socket = await ensureSocketConnected();

      const handleBindIssued = async (data: QrBindIssuedPayload) => {
        if (bindFlowIdRef.current !== flowId) return;

        const socketBindingToken = String(data?.socketBindingToken ?? "").trim();
        const expires = Number(data?.expiresInSeconds ?? 0);

        if (!socketBindingToken) {
          setQrStatus("ERROR");
          setError(Trans("QR.SOCKET_TOKEN_ERROR"));
          return;
        }

        try {
          const deviceInfo = navigator.userAgent;
          const response = await qrService.generate({
            socketBindingToken,
            deviceInfo,
          });

          const qrData = response?.payload?.data;
          const qrToken = qrData?.qrToken;
          const sessionId = qrData?.sessionId;
          const qrExpires = qrData?.expiresInSeconds || expires;

          if (!qrToken || !sessionId) {
            setQrStatus("ERROR");
            setError(Trans("QR.QR_TOKEN_ERROR"));
            return;
          }

          sessionIdRef.current = sessionId;
          setQrValue(qrToken);
          setQrStatus("WAITING");
          startCountdown(qrExpires > 0 ? qrExpires : 30);
        } catch (error: any) {
          setQrStatus("ERROR");
          setError(error?.message || Trans("QR.CREATE_SESSION_ERROR"));
        }
      };

      const handleConfirmed = (data: QrConfirmedPayload) => {
        if (bindFlowIdRef.current !== flowId) return;

        stopCountdown();
        setQrStatus("APPROVED");

        if (data?.accessToken) {
          setSessionToken(data.accessToken, data.user?.id ?? null);

          if (data.refreshToken) {
            setRefreshToken(data.refreshToken);
          }

          if (typeof data.expiresIn === "number") {
            setSessionTokenExpiresIn(data.expiresIn);
          }

          window.setTimeout(() => {
            window.location.href = "/me";
          }, 800);
        }
      };

      const handleRejected = (data: QrRejectedPayload) => {
        if (bindFlowIdRef.current !== flowId) return;

        stopCountdown();
        setQrStatus("ERROR");
        setError(
          data?.reason
            ? Trans("QR.REJECTED_WITH_REASON", { reason: data.reason })
            : Trans("QR.REJECTED_NO_REASON"),
        );
      };

      const handleWsError = (e: WsErrorPayload) => {
        if (bindFlowIdRef.current !== flowId) return;

        if (e?.code === "RATE_LIMIT_EXCEEDED") {
          stopCountdown();
          setQrStatus("ERROR");
          setError(Trans("QR.RATE_LIMIT_ERROR"));
          return;
        }

        if (e?.message) {
          stopCountdown();
          setQrStatus("ERROR");
          setError(e.message);
        }
      };

      socket.on("qr:bind:issued", handleBindIssued);
      socket.on("qr:confirmed", handleConfirmed);
      socket.on("qr:rejected", handleRejected);
      socket.on("ws:error", handleWsError);

      socket.emit("qr:bind:request");
    } catch (e) {
      cleanupQrListeners();
      stopCountdown();
      setQrStatus("ERROR");
      setError(e instanceof Error ? e.message : "Unknown error occurred");
    } finally {
      startingRef.current = false;
    }
  };

  useEffect(() => {
    startQrLogin();

    return () => {
      stopCountdown();
      cleanupQrListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Panel value="loginQR">
      <QRBox data-testid="login-tab-qr-box">
        <QrWrapper>
          <QRPlaceholder>
            {qrValue && qrStatus === "WAITING" ? (
              <QRCodeCanvas value={qrValue} size={220} includeMargin />
            ) : qrStatus === "LOADING" ? (
              <CircularProgress />
            ) : qrStatus === "APPROVED" ? (
              <Typography fontSize={18}>
                {Trans("QR.LOGIN_SUCCESS")}
              </Typography>
            ) : null}
          </QRPlaceholder>

          {qrStatus === "EXPIRED" && (
            <QrOverlay>
              <Typography fontWeight={700}>
                {Trans("QR.EXPIRED_TITLE")}
              </Typography>

              <Typography fontSize={13} color="#6B7280">
                {Trans("QR.EXPIRED_DESC")}
              </Typography>
            </QrOverlay>
          )}

          {qrStatus === "ERROR" && (
            <QrOverlay>
              <Typography fontWeight={700} color="error">
                {Trans("QR.ERROR_TITLE")}
              </Typography>

              <Typography fontSize={13} color="#6B7280">
                {error || Trans("QR.ERROR_DESC")}
              </Typography>
            </QrOverlay>
          )}
        </QrWrapper>

        {qrStatus === "WAITING" && (
          <CountdownText>
            {Trans("QR.EXPIRE_AFTER")} <b>{timeLeft}s</b>
          </CountdownText>
        )}

        <HelperText>{Trans("QR.ONLY_FOR_LOGIN")}</HelperText>
        <HelperText2>{Trans("QR.ZALO_PC")}</HelperText2>

        {qrStatus === "APPROVED" && (
          <Typography fontSize={14} color="success.main" fontWeight={600}>
            {Trans("QR.LOGIN_SUCCESS")}
          </Typography>
        )}

        {(qrStatus === "EXPIRED" || qrStatus === "ERROR") && (
          <Button
            variant="contained"
            onClick={startQrLogin}
            disabled={startingRef.current}
          >
            {startingRef.current
              ? Trans("QR.CREATING")
              : Trans("QR.CREATE_NEW")}
          </Button>
        )}
      </QRBox>
    </Panel>
  );
}