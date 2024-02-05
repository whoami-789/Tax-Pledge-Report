import React, {useState} from 'react';
import {Button, Form, Input, message, Upload} from "antd";
import {UploadOutlined} from '@ant-design/icons';
import {RcFile} from "antd/es/upload";


type FileWithPreview = RcFile & {
    preview: string;
};

function App() {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<FileWithPreview[]>([]);

    const beforeUpload = (file: RcFile) => {
        const isPDF = file.type === 'application/pdf';
        if (!isPDF) {
            message.error('You can only upload PDF file!');
            return Upload.LIST_IGNORE;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Заменяем текущий список файлов новым файлом
            setFileList([{
                ...file,
                preview: reader.result as string,
            }]);
        };
        return false; // Возвращаем false, чтобы остановить автоматическую загрузку
    };


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const base64Document = fileList.length > 0 ? fileList[0].preview : "";

            const payload = {
                jsonrpc: "2.0",
                id: "123",
                method: "adliya.remove_notarial_ban_set_by_notary",
                params: {
                    request_id: parseInt(values.requestId, 10),
                    reg_num: values.regNum,
                    statement: {
                        doc_num: values.docNum,
                        doc_date: values.docDate,
                        org_type: parseInt(values.orgType, 10),
                        org_post: parseInt(values.orgPost, 10),
                        doc_type: parseInt(values.docType, 10),
                        org_name: values.orgName,
                        org_fio: values.orgFio,
                        base_document: base64Document,
                    },
                    declarant: {
                        company_inn: values.companyInn,
                        company_name: null,
                        mfo: values.mfo,
                    },
                }
            };

            const response = await fetch('http://10.190.24.138:7075', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'Api-Token': 'application/json;charset=utf-8',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('Success:', responseData);
            message.success('Form submitted successfully');
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to submit the form');
        }
    };

    return (
        <div className="grid justify-center items-center h-svh">
            <h1 className="mb-5">Отправка данных о залогах в нотариус</h1>
            <Form
                layout="horizontal"
                form={form}
                style={{maxWidth: 600}}
                onFinish={handleSubmit}
            >
                <Form.Item name="reg_num" label="Регистрационный номер запрета АИС Нотариус">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item name="request_id" label="Код запроса банковской системы">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item name="doc_num" label="Номер документа-основания снятия запрета">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item name="doc_date" label="Дата документа-основания снятия  запрета">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item name="doc_type" label="Тип документа-основания снятия запрета">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item name="org_name" label="Наименование организации, которая снимает запрет">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item name="org_fio" label="ФИО лица с организации, снимающей запрет">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item name="org_post" label="Должность лица, лица с организации, снимающей запрет">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item name="org_type" label="Организации, снимающей запрет">
                    <Input placeholder="input placeholder"/>
                </Form.Item>
                <Form.Item
                    label="Скан-копия документа-основания снятия ареста/запрета (PDF в виде base64)"
                    name="documentUpload">
                    <Upload
                        beforeUpload={beforeUpload}
                        onRemove={file => {
                            setFileList(current => current.filter(item => item.uid !== file.uid));
                        }}
                        fileList={fileList.map(file => ({
                            uid: file.uid,
                            name: file.name,
                            status: 'done',
                        }))}
                        accept=".pdf"
                    >
                        <Button icon={<UploadOutlined/>}>Click to Upload</Button>
                    </Upload>
                </Form.Item>
                <Form.Item name="company_inn" label="ИНН">
                    <Input placeholder="input placeholder"/>
                </Form.Item>

                <Form.Item>
                    <Button type="default">Отправить</Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default App;
