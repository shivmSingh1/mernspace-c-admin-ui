import { Breadcrumb, Button, Drawer, Form, Space, Table, theme, Flex, Spin, Typography } from 'antd';
import { PlusOutlined, RightOutlined, LoadingOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { createUser, getUsers } from '../../http/api';
import type { CreateUserData, User, FieldData } from '../../types';
import { useAuthStore } from '../../store';
import UsersFilter from './UsersFilter';
import { useEffect, useMemo, useState } from 'react';
import UserForm from './forms/UserFrom';
import { PER_PAGE } from '../../constants';
import { debounce } from 'lodash';

const columns = [
	{
		title: 'ID',
		dataIndex: 'id',
		key: 'id',
	},
	{
		title: 'Name',
		dataIndex: 'firstName',
		key: 'firstName',
		render: (_text: string, record: User) => {
			return (
				<div>
					{record.firstName} {record.lastName}
				</div>
			);
		},
	},
	{
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
	},
	{
		title: 'Role',
		dataIndex: 'role',
		key: 'role',
	},
	{
		title: 'Restaurant',
		dataIndex: 'tenant',
		key: 'tenant',
		render: (_text: string, record: User) => {
			return <div>{record.tenant?.name}</div>;
		},
	},
];



const Users = () => {

	const [queryParams, setQueryParams] = useState({
		perPage: PER_PAGE,
		currentPage: 1,
	});

	const [form] = Form.useForm();
	const [filterForm] = Form.useForm();

	const queryClient = useQueryClient();

	const {
		token: { colorBgLayout },
	} = theme.useToken();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const {
		data: users,
		isFetching,
		isError,
		error,
	} = useQuery({
		queryKey: ['users', queryParams],
		queryFn: () => {
			const filteredParams = Object.fromEntries(
				Object.entries(queryParams).filter((item) => !!item[1])
			);
			const queryString = new URLSearchParams(
				filteredParams as unknown as Record<string, string>
			).toString();
			return getUsers(queryString).then((res) => res.data);
		},
		placeholderData: keepPreviousData,
	});

	const { user } = useAuthStore();

	const { mutate: userMutate } = useMutation({
		mutationKey: ['user'],
		mutationFn: async (data: CreateUserData) => createUser(data).then((res) => res.data),
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			return;
		},
	});

	const onHandleSubmit = async () => {
		await form.validateFields();
		await userMutate(form.getFieldsValue());
		form.resetFields();
		setDrawerOpen(false);
	};

	const debouncedQUpdate = useMemo(
		() =>
			debounce((value: string | undefined) => {
				setQueryParams((prev) => ({ ...prev, q: value, currentPage: 1 }));
			}, 500),
		[]
	);

	useEffect(() => {
		return () => {
			debouncedQUpdate.cancel();
		};
	}, [debouncedQUpdate]);

	const onFilterChange = (changedFields: FieldData[]) => {
		const changedFilterFields = changedFields
			.map((item) => ({
				[item.name[0]]: item.value,
			}))
			.reduce((acc, item) => ({ ...acc, ...item }), {});

		if ("q" in changedFilterFields) {
			debouncedQUpdate(changedFilterFields.q);
		} else {
			setQueryParams((prev) => ({ ...prev, ...changedFilterFields, currentPage: 1 }));
		}
	};

	if (user?.role !== 'admin') {
		return <Navigate to="/" replace={true} />;
	}

	return (
		<>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Flex justify="space-between">
					<Breadcrumb
						separator={<RightOutlined />}
						items={[{ title: <Link to="/">Dashboard</Link> }, { title: 'Users' }]}
					/>
					{isFetching && (
						<Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
					)}
					{isError && <Typography.Text type="danger">{error.message}</Typography.Text>}
				</Flex>

				<Form form={filterForm} onFieldsChange={onFilterChange}>
					<UsersFilter>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => setDrawerOpen(true)}>
							Add User
						</Button>
					</UsersFilter>
				</Form>

				<Table
					columns={columns}
					dataSource={users?.data}
					rowKey={'id'}
					pagination={{
						total: users?.total,
						pageSize: queryParams.perPage,
						current: queryParams.currentPage,
						onChange: (page) => {
							console.log(page);
							setQueryParams((prev) => {
								return {
									...prev,
									currentPage: page,
								};
							});
						},
						showTotal: (total: number, range: number[]) => {
							console.log(total, range);
							return `Showing ${range[0]}-${range[1]} of ${total} items`;
						},
					}}
				/>

				<Drawer
					title="Create user"
					styles={{ body: { backgroundColor: colorBgLayout } }}
					width={720}
					destroyOnClose={true}
					open={drawerOpen}
					onClose={() => {
						form.resetFields();
						setDrawerOpen(false);
					}}
					extra={
						<Space>
							<Button
								onClick={() => {
									form.resetFields();
									setDrawerOpen(false);
								}}>
								Cancel
							</Button>
							<Button type="primary" onClick={onHandleSubmit}>
								Submit
							</Button>
						</Space>
					}>
					<Form layout="vertical" form={form}>
						<UserForm />
					</Form>
				</Drawer>
			</Space>
		</>
	);
};

export default Users;