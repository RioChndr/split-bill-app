import { Box, Button, HStack, Heading, Input, Modal, ModalBody, ModalCloseButton, Link, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, VStack, useDisclosure } from '@chakra-ui/react'
import Head from 'next/head'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  type FormType = {
    people: {
      name: string
      billList: string,
      billTotal: number,
    }[],
    fax: number
  }

  const [modalName, setModalName] = useState<string>()
  const [modalBillList, setModalBillList] = useState<string>()
  const [selectedPeople, setSelectedPeople] = useState<number>()

  const formHook = useForm<FormType>()
  const peopleForm = useFieldArray({
    control: formHook.control,
    name: 'people'
  })

  const currencyFormat = (num: number) => {
    return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  const [result, setResult] = useState<{
    name: string
    billTotal: number,
    billWithTax: number
  }[]>()

  const [totalBill, setTotalBill] = useState<{
    bill: number
    withTax: number
  }>()

  function onSubmit(data: FormType) {
    const resultCalculate = data.people.map((item) => {
      return {
        name: item.name,
        billTotal: item.billTotal,
        billWithTax: item.billTotal + (item.billTotal * data.fax / 100)
      }
    })
    setResult(resultCalculate)

    const totalBillCalculate = resultCalculate.reduce((acc, cur) => {
      return {
        bill: acc.bill + cur.billTotal,
        withTax: acc.withTax + cur.billWithTax
      }
    }, { bill: 0, withTax: 0 })
    setTotalBill(totalBillCalculate)
  }

  return (
    <>
      <Head>
        <title>Split Bill app</title>
        <meta name="description" content="Split bill app, By rio chandra" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form onSubmit={formHook.handleSubmit(onSubmit)}>
        <main>
          <VStack w={{
            base: 'full',
            lg: '30vw'
          }}
            margin='auto'
          >
            <Heading>
              Split Bill app
            </Heading>
            {peopleForm.fields.length < 1 && (
              <Text color='orange.500'>
                No people added
              </Text>
            )}
            {peopleForm.fields.map((item, index) => {
              return (
                <HStack justifyContent={'space-between'} key={index} w='full' border='1px solid' borderColor='gray.400' p='3' borderRadius={'lg'}>
                  <Text>{item.name}</Text>
                  <Text fontWeight={'bold'}>
                    {currencyFormat(item.billTotal)}
                  </Text>
                </HStack>
              )
            })}
            <Button onClick={() => {
              onOpen()
            }}>
              Add people
            </Button>

            <Input placeholder='Tax (percent)' {...formHook.register('fax')}></Input>
            <Button colorScheme='blue' type='submit'>
              Calculate
            </Button>

            {result?.map((item, index) => {
              return (
                <HStack justifyContent={'space-between'} key={index} w='full' border='1px solid' borderColor='gray.400' p='3' borderRadius={'lg'}>
                  <Text>{item.name}</Text>
                  <Box textAlign='right'>
                    <Text>
                      {currencyFormat(item.billTotal)}
                    </Text>
                    <Text fontWeight={'bold'}>
                      With Tax : {currencyFormat(item.billWithTax)}
                    </Text>
                  </Box>
                </HStack>
              )
            })}
            {totalBill && (
              <>
                <HStack justifyContent={'space-between'} w='full' border='1px solid' borderColor='gray.400' p='3' borderRadius={'lg'}>
                  <Text>Total</Text>
                  <Box textAlign='right'>
                    <Text>
                      {currencyFormat(totalBill.bill)}
                    </Text>
                  </Box>
                </HStack>
                <HStack justifyContent={'space-between'} w='full' border='1px solid' borderColor='gray.400' p='3' borderRadius={'lg'}>
                  <Text>Total With tax</Text>
                  <Box textAlign='right'>
                    <Text>
                      {currencyFormat(totalBill.withTax)}
                    </Text>
                  </Box>
                </HStack>
              </>
            )}
            <Box as='footer' mt='6' display={'flex'} alignItems={'center'}>
              <Text mr='3'>
                By <Link href='https://riochndr.com' textDecor={'underline'}>Rio chandra</Link>
              </Text>
              <a href="https://trakteer.id/rio-chandra-kovdx" target="_blank"><img id="wse-buttons-preview" src="https://cdn.trakteer.id/images/embed/trbtn-red-1.png" style={{ border: '0px', height: '40px' }} alt="Trakteer Saya" height="40" /></a>
            </Box>
          </VStack>

        </main>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add People</ModalHeader>
            <ModalCloseButton />
            <ModalBody p='6'>
              <VStack>
                <Input placeholder='Name' value={modalName} onChange={(e) => setModalName(e.target.value)}></Input>
                <Textarea rows={10} w='full' placeholder="list bill" value={modalBillList} onChange={(e) => setModalBillList(e.target.value)}></Textarea>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Close
              </Button>
              <Button type='button'
                colorScheme='blue'
                onClick={() => {
                  if (!modalName || !modalBillList) return;
                  const totalBill = modalBillList.split(/\r?\n|\r|\n/g).reduce((acc, cur) => {
                    return acc + Number(cur)
                  }, 0)

                  if (selectedPeople) {
                    formHook.setValue(`people.${selectedPeople}.name`, modalName)
                    formHook.setValue(`people.${selectedPeople}.billList`, modalBillList)
                    formHook.setValue(`people.${selectedPeople}.billTotal`, totalBill)
                  } else {
                    peopleForm.append({
                      name: modalName,
                      billList: modalBillList,
                      billTotal: totalBill,
                    })
                  }
                  setModalName('')
                  setModalBillList('')
                  onClose()
                }}
              >Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </form>
    </>
  )
}
