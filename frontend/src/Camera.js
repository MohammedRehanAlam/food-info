import React, { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import {
  Box,
  Button,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTimes, FaCamera } from 'react-icons/fa';

const Camera = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const bgColor = useColorModeValue('gray.100', 'gray.700');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg={bgColor}
      zIndex="1000"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box position="relative" width="100%" height="100%">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "user"
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        <Flex
          position="absolute"
          bottom="20px"
          left="0"
          right="0"
          justifyContent="center"
          gap={4}
          px={4}
        >
          <Button
            onClick={onClose}
            leftIcon={<FaTimes />}
            colorScheme="red"
            size="lg"
            borderRadius="full"
          >
            Close
          </Button>
          <Button
            onClick={capture}
            leftIcon={<FaCamera />}
            colorScheme="blue"
            size="lg"
            borderRadius="full"
          >
            Capture
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Camera; 